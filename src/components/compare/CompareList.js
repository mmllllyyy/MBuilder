import React, {
    useImperativeHandle,
    forwardRef,
    useState,
    useRef,
    useMemo,
    useCallback,
} from 'react';
import {
    Button,
    FormatMessage,
    Modal,
    Terminal,
    openModal,
    CodeEditor,
} from 'components';
import {FixedSizeTree as Tree} from 'react-vtree';
import AutoSizer from 'react-virtualized-auto-sizer';

import _ from 'lodash/object';
import {connectDB, getLogPath, showItemInFolder, extractFile} from '../../lib/middle';
import {getPrefix} from '../../lib/prefixUtil';
import {
    getEmptyEntity,
    validateItem,
} from '../../lib/datasource_util';
import Node from './CompareItem';
import Container from './CompareContainer';
import {postWorkerFuc} from '../../lib/event_tool';

export default React.memo(forwardRef(({prefix, style, dataSource, config, empty,
                                          openLoading, closeLoading, mergeFromMeta,
                                          header, defaultMeta, calcDomain, scanTable, onPicker,
                                          onRemove, leftTitle, rightTitle,
                                          }, ref) => {
    const currentPrefix = getPrefix(prefix);
    const metaDataSource = dataSource.profile.metaData || [];
    const dbConn = dataSource.dbConn || [];
    const [meta, setMeta] = useState(defaultMeta);
    const [metaData, setMetaData] = useState([]);
    const [entitiesKeyChecked, setEntitiesKeyChecked] = useState([]);
    const entitiesKeyCheckedRef = useRef([]);
    entitiesKeyCheckedRef.current = [...entitiesKeyChecked];
    const [changes, setChanges] = useState([]);
    const [metaDataFields, setMetaDataFields] = useState([]);
    const [isCustomerMeta, setCustomerMeta] = useState(false);
    const [customerDataSource, setCustomerDataSource] = useState({});
    const isScan = useRef(false);
    const [treeData, setTreeData] = useState([]);
    const treeDataRef = useRef([]);
    treeDataRef.current = [...treeData];
    const metaDataRef = useRef([]);
    metaDataRef.current = [...metaData];
    const [expand, setExpand] = useState([]);
    // 头部两个固定数据
    const treeHeader = [{
        id: 'header1',
        children: [],
    }, {
        id: 'header2',
        children: [],
    }];
    // 父级列宽对象
    const columnWidth = {
      num: 20, // 动态计算
      view: 40,
      diff: 70,
      defKey: 200 * 2,
      defName: 200 * 2,
      comment: 200 * 2,
      fieldsCount: 60 * 2,
      opt: 150,
    };
    // 子级列宽对象
    const columnFieldWidth = {
        status: 30,
        defKey: 200,
        defName: 200,
        comment: 200,
        type: 100,
        length: 60,
        scale: 70,
    };
    if(defaultMeta) {
        columnWidth.remove = 40;
        columnFieldWidth.remove = 40;
    }
    const mergeMetaDataSourceKeys = (pre, next) => {
        const preKeys = pre.map(p => p.defKey?.toLocaleLowerCase());
        return (pre || []).concat(next
            .filter(n => !preKeys.includes(n.defKey?.toLocaleLowerCase())));
    };
    const resetTableList = () => {
        setChanges([]);
        setMetaDataFields([]);
        setTreeData([]);
    };
    useImperativeHandle(ref, () => {
        return {
            setMeta: (m, isCustomer) => {
                isScan.current = false;
                setMetaData([]);
                resetTableList();
                setCustomerMeta(isCustomer);
                setMeta(m);
            },
            setTreeData: (callback) => {
                isScan.current = true;
                setTreeData(callback);
            },
            setMetaData: (callback) => {
                setMetaData(callback);
            },
            setChanges: (callback) => {
                setChanges(callback);
            },
            getTreeData: () => {
                return treeDataRef.current;
            },
            setEntitiesKeyChecked: (callback) => {
                setEntitiesKeyChecked(callback);
            },
        };
    }, []);
    const errorModal = (result) => {
        const termReady = (term) => {
            term.write(typeof result.body === 'object' ? JSON.stringify(result.body, null, 2)
                : result.body);
        };
        Modal.error({
            bodyStyle: {width: '80%'},
            contentStyle: {width: '100%', height: '100%'},
            title: FormatMessage.string({id: 'optFail'}),
            message: <div>
              <div style={{textAlign: 'center'}}><FormatMessage id='dbConnect.log'/><a onClick={showItemInFolder}>{getLogPath()}</a></div>
              <Terminal termReady={termReady}/>
            </div>,
        });
    };
    const getTableList = () => {
        resetTableList();
        openLoading(FormatMessage.string({id: 'components.compare.scanTables'}));
        const currentConn = dbConn.filter(d => d.defKey === meta)[0];
        connectDB(dataSource, config, currentConn?.properties, 'DBReverseGetAllTablesList', (data) => {
            if (data.status === 'FAILED') {
                errorModal(data);
                closeLoading();
            } else {
                const newMetaData = data.body.map((d) => {
                    return {
                        ...d,
                        defName: d?.defName?.split(';')[0] || '',
                        comment: d.comment || d?.defName?.split(';')[1] || '',
                    };
                });
                postWorkerFuc('dataSourceVersion.simplePackageChanges', true, [
                    dataSource,
                    {
                        ...dataSource,
                        entities: newMetaData,
                    },
                    isCustomerMeta ? null :
                        dbConn.filter(d => d.defKey === meta)[0]?.type, true])
                    .then((c) => {
                        isScan.current = true;
                        // 构建 树形机构数据
                        const allData = mergeMetaDataSourceKeys(dataSource.entities, newMetaData);
                        setTreeData(treeHeader.concat(allData.map((d) => {
                            const id = d.defKey?.toLocaleLowerCase();
                            return {
                                id,
                                key: id,
                                sourceEntity: d.id ? d : {},
                                children : [{
                                    id: `${id}_headerField1`,
                                }, {
                                    id: `${id}_headerField2`,
                                }].concat((d?.fields || []).map(f => ({
                                    id: `${id}_${f.defKey}`,
                                    key: f.defKey?.toLocaleLowerCase(),
                                }))),
                            };
                        })));
                        setChanges(c.filter(change => change.opt !== 'update'));
                    }).finally(() => {
                    closeLoading();
                });
                setMetaData(newMetaData);
            }
        });
    };
    const extractData = () => {
        const analysisData = (d) => {
            try {
                const data = JSON.parse(d);
                const emptyEntity = getEmptyEntity();
                if(!data.entities || !Array.isArray(data.entities) ||
                    (data.entities || []).some((e) => {
                    return !validateItem(e, emptyEntity);
                })) {
                    throw Error();
                }
                postWorkerFuc('dataSourceVersion.simplePackageChanges', true, [
                    dataSource,
                    {
                        ...dataSource,
                        ...data,
                    }, null, true])
                    .then((c) => {
                        isScan.current = true;
                        setCustomerDataSource(data);
                        setMetaDataFields(data.entities);
                        setMetaData(data.entities);
                        const allData = mergeMetaDataSourceKeys(dataSource.entities
                            .map(e => ({...e, isSource: true})), data.entities);
                        setTreeData(treeHeader.concat(allData.map((a) => {
                            const id = a.defKey?.toLocaleLowerCase();
                            const metaIndex = data.entities
                                .findIndex(m => m.defKey?.toLocaleLowerCase() === id);
                            return {
                                id,
                                key: id,
                                sourceEntity: a.isSource ? a : {},
                                children : [{
                                    id: `${id}_headerField1`,
                                }, {
                                    id: `${id}_headerField2`,
                                }]
                                    .concat((a?.fields || [])
                                    .concat(
                                        (data.entities[metaIndex]?.fields || []).filter(f =>
                                        (a?.fields || [] || [])
                                            .findIndex(aF => aF.defKey?.toLocaleLowerCase()
                                                === f.defKey?.toLocaleLowerCase()) < 0))
                                        .map(f => ({
                                    id: `${id}_${f.defKey}`,
                                    key: f.defKey?.toLocaleLowerCase(),
                                }))),
                            };
                        })));
                        setChanges(c);
                    }).finally(() => {
                    closeLoading();
                });
            } catch (e) {
                Modal.error({
                    title: FormatMessage.string({id: 'optFail'}),
                    message: FormatMessage.string({id: 'components.compare.invalidMetaData'}),
                });
            }
        };
        resetTableList();
        openLoading(FormatMessage.string({id: 'components.compare.extractMetadata'}));
        const currentConn = metaDataSource.filter(d => d.defKey === meta)[0];
        if (currentConn.type === 'URL') {
            connectDB(dataSource, config, {
                url: currentConn.url,
            }, 'HttpParser', (data) => {
                if (data.status === 'FAILED') {
                    closeLoading();
                    errorModal(data);
                } else {
                    analysisData(data.body);
                }
            });
        } else {
            extractFile(currentConn.file).then((res) => {
                analysisData(res.toString());
            }).catch((e) => {
                closeLoading();
                Modal.error({
                    title: FormatMessage.string({id: 'optFail'}),
                    message: e.message,
                });
            });
        }
    };
    const getTableDetail = (table, currentDataSource) => {
        if(scanTable) {
            scanTable(table ? [table] : entitiesKeyChecked);
        } else {
            openLoading(FormatMessage.string({id: 'components.compare.scanField'}));
            const selectedMetaData = table ? [table] :
                metaData.filter(m => entitiesKeyChecked
                    .includes(m.defKey?.toLocaleLowerCase()))
                    .map(m => m.defKey);
            const selectedMetaDataLowKeys = selectedMetaData
                .map(m => m.toLocaleLowerCase());
            let tempMetaData;
            const updateChanges = (source) => {
                postWorkerFuc('dataSourceVersion.simplePackageChanges', true, [
                    {
                        ...source,
                        entities: (source.entities || [])
                            .filter(e => selectedMetaDataLowKeys
                                .includes(e.defKey?.toLocaleLowerCase())),
                    },
                    {
                        ...isCustomerMeta ? customerDataSource : source,
                        entities: tempMetaData,
                    },
                    isCustomerMeta ? null :
                        dbConn.filter(d => d.defKey === meta)[0]?.type, true])
                    .then((newChanges) => {
                        // 合并变更信息
                        setChanges((pre) => {
                            return pre.filter((p) => {
                                return !selectedMetaDataLowKeys
                                    .includes(p.data.baseInfo?.defKey?.toLocaleLowerCase());
                            }).concat(newChanges);
                        });
                    }).finally(() => {
                    closeLoading();
                });
            };
            if(currentDataSource) {
                tempMetaData = metaDataFields.filter(m => selectedMetaData.includes(m.defKey));
                const entities = currentDataSource.entities
                    .filter(e => selectedMetaDataLowKeys.includes(e.defKey?.toLocaleLowerCase()));
                setTreeData((pre) => {
                    return pre.map((p) => {
                        const entityIndex = entities
                            .findIndex(m => m.defKey?.toLocaleLowerCase() === p.id);
                        if(entityIndex > -1) {
                            return {
                                ...p,
                                sourceEntity: entities[entityIndex],
                            };
                        }
                        return p;
                    });
                });
                updateChanges(currentDataSource);
            } else {
                const currentConn = dbConn.filter(d => d.defKey === meta)[0];
                connectDB(dataSource, config, {
                    ...currentConn?.properties,
                    tables: selectedMetaData.join(','),
                }, 'DBReverseGetTableDDL', (data) => {
                    if (data.status === 'FAILED') {
                        errorModal(data);
                    } else {
                        tempMetaData = data.body.map((d) => {
                            const currentMetaIndex = metaData.findIndex(m => m.defKey === d.defKey);
                            return {
                                ...d,
                                defName: metaData[currentMetaIndex]?.defName || '',
                                comment: metaData[currentMetaIndex]?.comment || '',
                                fields: (d.fields || []).map((f) => {
                                    return {
                                        ...f,
                                        defName: f?.defName?.split(';')[0] || '',
                                        comment: f.comment || f?.defName?.split(';')[1] || '',
                                    };
                                }),
                            };
                        });
                        // 合并详细数据
                        setMetaDataFields((pre) => {
                            return pre.filter((p) => {
                                return !selectedMetaDataLowKeys
                                    .includes(p.defKey?.toLocaleLowerCase());
                            }).concat(calcDomain(tempMetaData, meta,
                                dataSource.domains || []));
                        });
                        // 合并树
                        setTreeData((pre) => {
                            return pre.map((p) => {
                                const metaIndex = tempMetaData
                                    .findIndex(m => m.defKey?.toLocaleLowerCase() === p.id);
                                if(metaIndex > -1) {
                                    return {
                                        ...p,
                                        children: (p.children || [])
                                            .concat((tempMetaData[metaIndex].fields || [])
                                                .filter(f =>
                                                    (p.children || [])
                                                        .findIndex(c => c.key?.toLocaleLowerCase()
                                                            === f.defKey?.toLocaleLowerCase()) < 0)
                                                .map((f) => {
                                                    return {
                                                        id: `${p.id}_${f.defKey}`,
                                                        key: f.defKey?.toLocaleLowerCase(),
                                                    };
                                                })),
                                    };
                                }
                                return p;
                            });
                        });
                        updateChanges(dataSource);
                    }
                });
            }
        }
    };
    const showDDL = (btn) => {
        btn.updateStatus('loading');
        postWorkerFuc('dataSourceVersion.getChanges', true, [
            changes.filter(c => c.opt !== 'delete'),
            dataSource,
        ])
            .then((value) => {
                let modal;
                const close = () => {
                    modal && modal.close();
                };
                modal = openModal(<CodeEditor
                  mode='sql'
                  value={value}
                  width='auto'
                  height='calc(100vh - 135px)'
                />, {
                    bodyStyle: { width: '80%' },
                    title: FormatMessage.string({id: 'components.compare.ddl'}),
                    buttons: [
                      <Button key='close' onClick={close}><FormatMessage id='button.cancel'/></Button>],
                });
            }).finally(() => {
            btn.updateStatus('normal');
        });
    };
    const _mergeFromMeta = (metaKey, sourceKey, dataKey) => {
        if(defaultMeta) {
            mergeFromMeta && mergeFromMeta(metaKey, sourceKey, dataKey);
        } else {
            const currentMetaDataIndex = metaDataFields
                .findIndex(m => m.defKey === metaKey);
            const currentMetaData = metaDataFields[currentMetaDataIndex];
            const resultDataSource = mergeFromMeta([{
                ...currentMetaData,
                id: Math.uuid(),
                fields: (currentMetaData.fields || []).map((f) => {
                    return {
                        ...f,
                        primaryKey: !!f.primaryKey,
                        notNull: !!f.notNull,
                        id: Math.uuid(),
                    };
                }),
            }], isCustomerMeta ? null : meta, isCustomerMeta ? metaDataSource : null);
            getTableDetail(metaKey, resultDataSource);
        }
    };
    const dB = useMemo(() => {
        const currentDb = !isCustomerMeta ? dbConn.filter(d => d.defKey === meta)[0]?.type : _.get(dataSource, 'profile.default.db', dataSource.profile?.dataTypeSupports[0]?.id);
        if (isCustomerMeta) {
            const currentDbData = dataSource
                .profile?.dataTypeSupports?.filter(d => d.id === currentDb)[0];
            const tempSource = {
                ...dataSource,
                ...customerDataSource,
            };
            return [currentDb, tempSource.profile?.dataTypeSupports
                ?.filter(d => d?.defKey?.toLocaleLowerCase()
                === currentDbData?.defKey?.toLocaleLowerCase())[0]?.id
                || _.get(tempSource, 'profile.default.db', tempSource.profile?.dataTypeSupports[0]?.id)];
        }
        return [currentDb];
    }, [meta]);
    const _checkBoxChange = (e, key) => {
        setEntitiesKeyChecked((pre) => {
            if (e) {
                if (!e.target.checked) {
                    return pre.filter(p => p !== key);
                }
                return pre.concat(key);
            } else if (key === 'ind' || key === 'normal') {
                return metaDataRef.current.map(m => m.defKey?.toLocaleLowerCase());
            }
            return [];
        });
    };
    const getNodeData = (node, nestingLevel, i, parent) => ({
        data: {
            dataKey: node.key,
            defaultHeight: 27,
            id: node.id,
            metaFieldsData: node.metaFieldsData,
            metaEntityData: node.metaEntityData,
            sourceEntity: node.sourceEntity,
            isLeaf: !node.children,
            isOpenByDefault: expand.includes(node.key),
            nestingLevel,
            parent,
            i,
        },
        nestingLevel,
        node,
    });
    function* treeWalker() {
        for (let i = 0; i < treeData.length; i += 1) {
            yield getNodeData(treeData[i], 0, i);
        }

        while (true) {
            const parent = yield;

            for (let i = 0; i < parent.node?.children?.length; i += 1) {
                yield getNodeData(parent.node.children[i], parent.nestingLevel + 1, i, parent.node);
            }
        }
    }
    const countWidth = useMemo(() => treeData.length.toString().split('').length * 10 + 20,
        [treeData.length]);
    const allColumnWidth = useMemo(() => Object.keys(columnWidth)
        .reduce((p, n) => p + columnWidth[n], countWidth), [countWidth]);
    const type = useMemo(() => {
        if(entitiesKeyChecked.length > 0) {
            if(entitiesKeyChecked.length === metaData.length) {
                return 'all';
            } else {
                return 'ind';
            }
        }
        return 'normal';
    }, [entitiesKeyChecked.length, metaData.length]);
    const innerElementType = useCallback((props) => {
        return <Container
          {...props}
          type={type}
          allColumnWidth={allColumnWidth}
          columnWidth={columnWidth}
          countWidth={countWidth}
          checkBoxChange={_checkBoxChange}
          leftTitle={leftTitle}
          rightTitle={rightTitle}
          defaultMeta={defaultMeta}
          isCustomerMeta={isCustomerMeta}
        />;
    }, [type, countWidth]);
    return <div style={style} className={`${currentPrefix}-compare-list`}>
      {meta ? <div className={`${currentPrefix}-compare-list-container`}>
        {header ? header(entitiesKeyChecked) : <div className={`${currentPrefix}-compare-list-container-header`}>
          <span>
            {
                isCustomerMeta ? <Button disable={!meta} type="primary" onClick={extractData}>
                  <FormatMessage id="components.compare.extractMetadata"/>
                </Button> : <><Button disable={!meta} type="primary" onClick={getTableList}>
                  <FormatMessage id="components.compare.scanTables"/>
                </Button>
                  <Button
                    onClick={() => getTableDetail()}
                    disable={!meta || entitiesKeyChecked.length === 0}
                    type="primary">
                    <FormatMessage id="components.compare.scanField"/>
                  </Button>
                  <Button
                    onClick={(e, btn) => showDDL(btn)}
                    disable={!meta || changes.length === 0}
                    type="primary">
                    <FormatMessage id="components.compare.ddl"/>
                  </Button></>
            }
          </span>
          <span>
            {
                (isCustomerMeta ? metaDataSource : dbConn)
                    .filter(d => d.defKey === meta)[0]?.defName || meta
            }
          </span>
        </div>}
        <div className={`${currentPrefix}-compare-list-container-content`}>
          {
              !isScan.current ? <div className={`${currentPrefix}-compare-list-container-content-empty`}>
                {empty || <FormatMessage id={`components.compare.${isCustomerMeta ? 'extractedFirst' : 'scanTablesFirst'}`}/>}
              </div> : <div className={`${currentPrefix}-compare-list-container-content-list`}>
                {treeData.length > 0 && <AutoSizer>
                    {({height, width}) => {
                          return  <Tree
                            innerElementType={innerElementType}
                            itemSize={27}
                            treeWalker={treeWalker}
                            height={height}
                            width={width}
                          >
                            {props => <Node
                              {...props}
                              entitiesKeyChecked={entitiesKeyChecked}
                              allColumnWidth={allColumnWidth}
                              columnFieldWidth={columnFieldWidth}
                              countWidth={countWidth}
                              columnWidth={columnWidth}
                              isCustomerMeta={isCustomerMeta}
                              defaultMeta={defaultMeta}
                              changes={changes}
                              checkBoxChange={_checkBoxChange}
                              metaDataFields={metaDataFields}
                              metaData={metaData}
                              getTableDetail={getTableDetail}
                              mergeFromMeta={_mergeFromMeta}
                              dB={dB}
                              onPicker={onPicker}
                              leftTitle={leftTitle}
                              rightTitle={rightTitle}
                              dataSource={dataSource}
                              customerDataSource={customerDataSource}
                              onRemove={onRemove}
                              setExpand={setExpand}
                            />}
                          </Tree>;
                      }}
                  </AutoSizer>}
              </div>
              }
        </div>
      </div> :
      <div className={`${currentPrefix}-compare-list-container-content-empty`}>
        <FormatMessage id='components.compare.selectedFirst'/>
      </div>}
    </div>;
}));
