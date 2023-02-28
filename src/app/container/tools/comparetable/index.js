import React, { useState, useRef, useMemo } from 'react';
import {
    Button,
    FormatMessage,
    openModal,
    Tree,
    Tooltip,
    Icon,
    Download,
    Upload,
    Modal, Message,
} from 'components';
import moment from 'moment';
import CompareList from 'components/compare/CompareList';
import {calcUnGroupDefKey, mergeDataSource} from '../../../../lib/datasource_util';

import './style/index.less';
import { separator } from '../../../../../profile';
import {getPrefix} from '../../../../lib/prefixUtil';
import {simplePackageChanges} from '../../../../lib/datasource_version_util';

export default React.memo(({dataSource, getDataSource, prefix,
                               openLoading, closeLoading, updateProject}) => {
    const tempDataSource = useMemo(() => new Proxy({...dataSource}, {
        get(target, property){
            return getDataSource()[property];
        },
    }), []);
    const compareListRef = useRef(null);
    const currentPrefix = getPrefix(prefix);
    const [entitiesKeys, setEntitiesKeys] = useState([]);
    const [checked, setChecked] = useState([]);
    const checkedRef = useRef([]);
    checkedRef.current = [...checked];
    const entitiesKeysRef = useRef([]);
    entitiesKeysRef.current = entitiesKeys;
    const mergeFromMeta = (d, callback) => {
        const entities = tempDataSource.entities || [];
        const leftData = entities.filter(e => e.defKey === d.left)[0];
        const rightData = entities.filter(e => e.defKey === d.right)[0];
        const currentDataSource = {
            ...dataSource,
            entities,
        };
        const mergeData = {
            ...mergeDataSource(currentDataSource, {
                entities,
            }, [{
                ...leftData,
                fields: (rightData.fields || []),
            }], true),
        };
        callback(mergeData.entities);
        updateProject(mergeData);
    };
    const onCheck = (values) => {
        setChecked(values);
    };
    const addRow = () => {
        setEntitiesKeys(pre => pre.concat({
            key: Math.uuid(),
            left: '',
            right: '',
        }));
    };
    const scanFields = () => {
        const data = (tempDataSource.entities || [])
            .filter(c => checked.map(k => k.right).includes(c.defKey));
        compareListRef.current.setMetaDataFields((pre) => {
            return pre.filter(p => data.findIndex(b => b.defKey === p.defKey) < 0)
                .concat(data.map((d) => {
                    return d;
                }));
        });
        const checkKeys = checkedRef.current.map(c => c.key);
        const selectedData = entitiesKeysRef.current
            .filter(k => checkKeys.includes(k.key));
        const entities = tempDataSource.entities || [];
        const compareData = selectedData.map((k) => {
            const leftData = entities.filter(e => e.defKey === k.left)[0] || {};
            const rightData = entities.filter(e => e.defKey === k.right)[0] || {};
            return {
                ...k,
                left: {
                    ...leftData,
                    defKey: k.key,
                },
                right: {
                    ...rightData,
                    defKey: k.key,
                },
            };
        });
        const newChanges = simplePackageChanges({
                ...dataSource,
                entities: compareData.map(c => c.left),
            }, {
                ...dataSource,
                entities: compareData.map(c => c.right),
            },
            null, true);
        compareListRef.current.setChanges((pre) => {
            return pre
                .filter(p => compareData
                    .findIndex(c => c.key.toLocaleLowerCase() === p.data?.baseInfo?.defKey) < 0)
                .concat(newChanges.concat(selectedData
                    .filter(s => newChanges
                        .findIndex(c => c.data.baseInfo.defKey === s.key.toLocaleLowerCase()) < 0)
                    .map((s) => {
                        return {
                            data: {
                                baseInfo: {
                                    defKey: s.key.toLocaleLowerCase(),
                                },
                            },
                        };
                    })));
        });
    };
    const loadList = () => {
        Upload('application/json', (d) => {
            const data = JSON.parse(d);
            if (!data.compareTableList || !Array.isArray(data.compareTableList)) {
                Modal.error({
                    title: FormatMessage.string({id: 'optFail'}),
                    message: FormatMessage.string({id: 'components.compare.invalidTableList'}),
                });
            } else {
                const mergeList = (compareTableList) => {
                    const compareTableListKeys = compareTableList
                        .map(c => c.right?.toLocaleLowerCase()).filter(c => !!c);
                    const meta = (tempDataSource.entities || [])
                        .filter(e => compareTableListKeys.includes(e.defKey?.toLocaleLowerCase()));
                    setEntitiesKeys((pre) => {
                        return pre.concat(compareTableList.map((c) => {
                            return {
                                key: Math.uuid(),
                                left: c.leftLose ? '' : c.left,
                                right: c.rightLose ? '' : c.right,
                            };
                        }));
                    });
                    compareListRef.current.setMetaData((pre) => {
                        return pre.concat(meta.filter(m => pre.findIndex(p => p.id === m.id) < 0));
                    });
                    Message.success({title: FormatMessage.string({id: 'optSuccess'})});
                };
                const entities = tempDataSource.entities || [];
                const currentCompareTableList = data.compareTableList.map((c) => {
                    const left = entities
                        .filter(e => e.defKey?.toLocaleLowerCase()
                            === c.left?.toLocaleLowerCase())[0];
                    const right = entities
                        .filter(e => e.defKey?.toLocaleLowerCase()
                            === c.right?.toLocaleLowerCase())[0];
                    return {
                        ...c,
                        left: left ? left.defKey : c.left,
                        leftLose: !!(!left && c.left),
                        right: right ? right.defKey : c.right,
                        rightLose: !!(!right && c.right),
                    };
                });
                if (currentCompareTableList.some(c => c.leftLose || c.rightLose)) {
                    Modal.confirm({
                        title: FormatMessage.string({id: 'components.compare.loadConfirmTitle'}),
                        message: FormatMessage.string({id: 'components.compare.loadConfirmMessage', data: {data: ''}}),
                        onOk:() => {
                            mergeList(currentCompareTableList);
                        },
                    });
                } else {
                    mergeList(currentCompareTableList);
                }
            }
        }, (file) => {
            const result = file.name.endsWith('.json');
            if (!result) {
                Modal.error({
                    title: FormatMessage.string({id: 'optFail'}),
                    message: FormatMessage.string({id: 'components.compare.invalidTableList'}),
                });
            }
            return result;
        });
    };
    const saveList = () => {
        Download(
            [JSON.stringify({
                compareTableList: entitiesKeysRef.current.filter((e) => {
                    return e.left || e.right;
                }),
            }, null, 2)],
            'application/json',
            `${dataSource.name}-${FormatMessage.string({id: 'components.compare.compareList'})}-${moment().format('YYYYMDHHmmss')}.json`);
    };
    const onRemove = (d) => {
        setEntitiesKeys(pre => pre.filter(p => p.key !== d.key));
        compareListRef.current.setChanges((pre) => {
            return pre.filter(p => p.data.baseInfo.defKey !== d.key?.toLocaleLowerCase());
        });
    };
    const onPicker = (key, position) => {
        let modal, value;
        const onCancel = () => {
            modal && modal.close();
        };
        const onOk = () => {
            if (value?.length > 0) {
                const entity = (tempDataSource.entities || [])
                    .filter(e => e.id === value[0].split(separator)[1])[0] || {};
                setEntitiesKeys((pre) => {
                    return pre.map((p) => {
                        if (p.key === key) {
                            return {
                                ...p,
                                [position]: entity.defKey,
                            };
                        }
                        return p;
                    });
                });
                compareListRef.current.setChanges((pre) => {
                    return pre.filter(p => p.data.baseInfo.defKey !== key.toLocaleLowerCase());
                });
                if (position === 'right') {
                    compareListRef.current.setMetaData((pre) => {
                        if (pre.findIndex(p => p.id === entity.id) < 0) {
                            return pre.concat(entity);
                        }
                        return pre;
                    });
                }
            }
            modal && modal.close();
        };
        const onChange = (values) => {
            value = values;
        };
        const getData = () => {
          return (tempDataSource.viewGroups || [])
              .concat({
                  id: '__ungroup',
                  defKey: '__ungroup',
                  defName: FormatMessage.string({id: 'exportSql.defaultGroup'}),
                  refEntities: calcUnGroupDefKey(tempDataSource, 'entities'),
              }).map((g) => {
                  return {
                      key: g.id,
                      value: g.defName || g.defKey,
                      children: (tempDataSource.entities || [])
                          .filter(e => g.refEntities.includes(e.id)).map((e) => {
                              return {
                                  key: `${g.id}${separator}${e.id}`,
                                  value: `${e.defName}(${e.defKey})`,
                              };
                          }),
                  };
              });
        };
        modal = openModal(<div className={`${currentPrefix}-compare-table-entity-select`}><Tree
          onChange={onChange}
          simpleChecked
          dataSource={getData()}
        /></div>, {
            bodyStyle: { width: '50%' },
            buttons:  [<Button type='primary' key='ok' onClick={onOk}>
              <FormatMessage id='button.ok'/>
            </Button>,
              <Button key='cancel' onClick={onCancel}>
                <FormatMessage id='button.cancel'/>
              </Button>],
            title: FormatMessage.string({id: 'components.compare.entityPicker'}),
        });
    };
    return <div className={`${currentPrefix}-compare-table`}>
      <CompareList
        onCheck={onCheck}
        entitiesKeys={entitiesKeys}
        ref={compareListRef}
        defaultMeta={Math.uuid()}
        empty={<FormatMessage id='components.compare.tableListEmpty'/>}
        header={<div className={`${currentPrefix}-compare-table-header`}>
          <Tooltip placement='top' force title={<div style={{width: 180}}><FormatMessage id='components.compare.addRowTips'/></div>}>
            <span>
              <Button type="primary" onClick={addRow}>
                <Icon type='fa-plus'/><span> <FormatMessage id='components.compare.addRow'/></span>
              </Button>
            </span>
          </Tooltip>
          <Button type="primary" onClick={scanFields} disable={checked.length === 0}>
            <FormatMessage id='components.compare.scanFieldDiff'/>
          </Button>
          <Button
            onClick={loadList}
            type="primary"
          >
            <FormatMessage id='components.compare.loadTableList'/>
          </Button>
          <Button
            onClick={saveList}
            type="primary"
          >
            <FormatMessage id='components.compare.saveTableList'/>
          </Button>
        </div>}
        onRemove={onRemove}
        onPicker={onPicker}
        dataSource={tempDataSource}
        openLoading={openLoading}
        closeLoading={closeLoading}
        mergeFromMeta={mergeFromMeta}
        leftTitle={<span style={{color: '#000000'}}><FormatMessage id='components.compare.checkTable'/></span>}
        rightTitle={<span style={{color: 'red'}}><FormatMessage id='components.compare.diffTable'/></span>}
      />
    </div>;
});
