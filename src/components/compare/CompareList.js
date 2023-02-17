import React, {useImperativeHandle, forwardRef, useState, useRef, useEffect} from 'react';
import {Button, FormatMessage, Modal, Terminal, Checkbox, Icon, openModal, CodeEditor} from 'components';

import _ from 'lodash/object';
import {connectDB, getLogPath, showItemInFolder, extractFile} from '../../lib/middle';
import {getPrefix} from '../../lib/prefixUtil';
import {getChanges, simplePackageChanges} from '../../lib/datasource_version_util';
import {
    transform,
    getEmptyEntity,
    validateItem,
} from '../../lib/datasource_util';

export default React.memo(forwardRef(({prefix, style, dataSource, config,
                                          openLoading, closeLoading, mergeFromMeta}, ref) => {
    const currentPrefix = getPrefix(prefix);
    const metaDataSource = dataSource.profile.metaData || [];
    const dbConn = dataSource.dbConn || [];
    const [meta, setMeta] = useState('');
    const [metaData, setMetaData] = useState([]);
    const [selectedTable, setSelectedTable] = useState([]);
    const [expand, setExpand] = useState([]);
    const selectedTableRef = useRef([]);
    selectedTableRef.current = [...selectedTable];
    const [changes, setChanges] = useState([]);
    const [metaDataFields, setMetaDataFields] = useState([]);
    const [isCustomerMeta, setCustomerMeta] = useState(false);
    const [customerDataSource, setCustomerDataSource] = useState({});
    const [columnWidth, setColumnWidth] = useState([]);
    const firstRef = useRef(null);
    const secondRef = useRef(null);
    useImperativeHandle(ref, () => {
        return {
            setMeta: (m, isCustomer) => {
                setMetaData([]);
                setSelectedTable([]);
                setExpand([]);
                setChanges([]);
                setMetaDataFields([]);
                setCustomerMeta(isCustomer);
                setMeta(m);
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
        openLoading(FormatMessage.string({id: 'components.compare.scanTables'}));
        const currentConn = dbConn.filter(d => d.defKey === meta)[0];
        connectDB(dataSource, config, currentConn?.properties, 'DBReverseGetAllTablesList', (data) => {
            if (data.status === 'FAILED') {
                errorModal(data);
            } else {
                setMetaData(data.body.map((d) => {
                    return {
                        ...d,
                        defName: d?.defName?.split(';')[0] || '',
                        comment: d.comment || d?.defName?.split(';')[1] || '',
                    };
                }));
            }
            closeLoading();
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
                setCustomerDataSource(data);
                setMetaDataFields(data.entities);
                setMetaData(data.entities);
            } catch (e) {
                Modal.error({
                    title: FormatMessage.string({id: 'optFail'}),
                    message: FormatMessage.string({id: 'components.compare.invalidMetaData'}),
                });
            }
        };
        openLoading(FormatMessage.string({id: 'components.compare.extractMetadata'}));
        const currentConn = metaDataSource.filter(d => d.defKey === meta)[0];
        if (currentConn.type === 'URL') {
            connectDB(dataSource, config, {
                url: currentConn.url,
            }, 'HttpParser', (data) => {
                if (data.status === 'FAILED') {
                    errorModal(data);
                } else {
                    analysisData(data.body);
                }
                closeLoading();
            });
        } else {
            extractFile(currentConn.file).then((res) => {
                analysisData(res.toString());
            }).finally(() => {
                closeLoading();
            }).catch((e) => {
                Modal.error({
                    title: FormatMessage.string({id: 'optFail'}),
                    message: e.message,
                });
            });
        }
    };
    const getTableDetail = (table) => {
        openLoading(FormatMessage.string({id: 'components.compare.scanField'}));
        const currentConn = dbConn.filter(d => d.defKey === meta)[0];
        connectDB(dataSource, config, {
            ...currentConn?.properties,
            tables: table || selectedTableRef.current.join(','),
        }, 'DBReverseGetTableDDL', (data) => {
            if (data.status === 'FAILED') {
                errorModal(data);
            } else {
                setMetaDataFields((pre) => {
                    return pre.filter(p => data.body.findIndex(b => b.defKey === p.defKey) < 0)
                        .concat(data.body.map((d) => {
                            const currentMeta = metaData.filter(m => m.defKey === d.defKey)[0];
                            return {
                                ...d,
                                defName: currentMeta?.defName || '',
                                comment: currentMeta?.comment || '',
                                fields: (d.fields || []).map((f) => {
                                    return {
                                        ...f,
                                        defName: f?.defName?.split(';')[0] || '',
                                        comment: f.comment || f?.defName?.split(';')[1] || '',
                                    };
                                }),
                            };
                        }));
                });
            }
            closeLoading();
        });
    };
    const showDDL = () => {
        let modal;
        const close = () => {
            modal && modal.close();
        };
        modal = openModal(<CodeEditor
          mode='sql'
          value={getChanges(changes.filter(c => c.opt !== 'delete'), dataSource)}
          width='auto'
          height='calc(100vh - 135px)'
        />, {
            bodyStyle: { width: '80%' },
            title: FormatMessage.string({id: 'components.compare.ddl'}),
            buttons: [
              <Button key='close' onClick={close}><FormatMessage id='button.cancel'/></Button>],
        });
    };
    useEffect(() => {
        const newChanges = simplePackageChanges(dataSource, {
            ...dataSource,
            ...(isCustomerMeta ? customerDataSource : {}),
            entities: metaDataFields,
        }, isCustomerMeta ? null : dbConn.filter(d => d.defKey === meta)[0]?.type, isCustomerMeta);
        setChanges(newChanges.filter((c) => {
            if (c.opt === 'add') {
                return metaData
                    .findIndex(m => m.defKey?.toLocaleLowerCase()
                        === c.data?.defKey?.toLocaleLowerCase()) < 0;
            }
            return true;
        }));
    }, [metaDataFields, metaData, dataSource.entities, meta]);
    useEffect(() => {
        setColumnWidth([firstRef.current?.clientWidth + 2, secondRef.current?.clientWidth + 1]);
    }, [changes]);
    const mergeMetaDataSourceKeys = (pre, next) => {
        return (pre || []).concat(next).reduce((a, b) => {
            if (a.findIndex(d => b.defKey?.toLocaleLowerCase() === d?.toLocaleLowerCase()) < 0) {
                return a.concat(b.defKey);
            }
            return a;
        }, []);
    };
    const _mergeFromMeta = (metaKey) => {
        mergeFromMeta && mergeFromMeta(metaDataFields.filter(m => m.defKey === metaKey).map((m) => {
            return {
                ...m,
                id: Math.uuid(),
                fields: (m.fields || []).map((f) => {
                    return {
                        ...f,
                        primaryKey: !!f.primaryKey,
                        notNull: !!f.notNull,
                        id: Math.uuid(),
                    };
                }),
            };
        }), isCustomerMeta ? null : meta, isCustomerMeta ? metaDataSource : null);
    };
    const getStatus = (sourceEntity, metaEntity) => {
        if(metaEntity.defKey && !metaDataFields.filter(m => m.defKey === metaEntity.defKey)[0]) {
            return [<span className={`${currentPrefix}-compare-list-container-content-list-item-wait`}>
              <span>
                <Icon type='fa-clock-o'/>
              </span>
              <span><FormatMessage id='components.compare.wait'/></span>
            </span>, 'wait'];
        } else if (!(sourceEntity.defKey && metaEntity.defKey)
            || changes.filter(c => c.opt === 'update')
                .some(c =>
                (c.data.baseInfo?.defKey?.toLocaleLowerCase()
                    === sourceEntity.defKey?.toLocaleLowerCase()) ||
                (c.data.baseInfo?.defKey?.toLocaleLowerCase()
                    === metaEntity.defKey?.toLocaleLowerCase()))) {
            return [<span className={`${currentPrefix}-compare-list-container-content-list-item-diff`}>
              <span>
                <Icon type='fa-times-circle-o'/>
              </span>
              <span><FormatMessage id='components.compare.diff'/></span>
            </span>, 'diff'];
        }
        return [<span className={`${currentPrefix}-compare-list-container-content-list-item-same`}>
          <span>
            <Icon type='fa-check-circle-o'/>
          </span>
          <span><FormatMessage id='components.compare.same'/></span>
        </span>, 'same'];
    };
    const _setExpand = (defKey) => {
        setExpand((pre) => {
            if (pre.includes(defKey)) {
                return pre.filter(p => p !== defKey);
            }
            return pre.concat(defKey);
        });
    };
    const getDb = () => {
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
    };
    const getChildren = (source, metaEntity) => {
        const sourceEntity = {
            ...source,
        };
      const changeEntity = changes
          .filter(c => (c.data?.defKey?.toLocaleLowerCase()
                  || c.data?.baseInfo?.defKey?.toLocaleLowerCase()) ===
              (sourceEntity.defKey || metaEntity.defKey)?.toLocaleLowerCase())[0] || {
          data: metaEntity,
      };
      const allFields = mergeMetaDataSourceKeys(sourceEntity.fields || [], metaEntity.fields || []);
      return allFields.map((f) => {
          const [cDb, pDb] = getDb();
          const sourceTempField = (sourceEntity.fields || [])
              .filter(e => e.defKey?.toLocaleLowerCase()
                  === f?.toLocaleLowerCase())[0];
          const sourceField = sourceTempField ? {
              ...sourceTempField,
              ...transform(sourceTempField, dataSource, cDb),
          } : {};
          const metaTempField = (metaEntity.fields || [])
              .filter(e => e.defKey?.toLocaleLowerCase()
                  === f?.toLocaleLowerCase())[0];
          const metaField = (metaTempField && isCustomerMeta) ?
              {
                  ...metaTempField,
                  ...transform(metaTempField, {
                      ...dataSource,
                      ...customerDataSource,
                  },  pDb),
              } : (metaTempField || {});
          const calcIsDiff = () => {
            if (!changeEntity.opt) {
                return false;
            } else if (changeEntity.opt === 'update') {
                return (changeEntity.data.fieldAdded || [])
                    .concat(changeEntity.data.fieldRemoved || [])
                    .concat(changeEntity.data.fieldModified || [])
                    .some((c) => {
                    return c.defKey?.toLocaleLowerCase() === f?.toLocaleLowerCase();
                });
            }
            return true;
          };
          const isDiff = calcIsDiff();
          return <tr key={f}>
            <td>
              <span className={`${currentPrefix}-compare-list-container-content-list-item-${isDiff ? 'diff' : 'same'}`}>
                {
                      isDiff ?  <Icon type='fa-times-circle-o'/> : <Icon type='fa-check-circle-o'/>
                  }
              </span>
            </td>
            <td style={{textAlign: 'left'}}>
              <span>{sourceField.defKey}</span>
            </td>
            <td style={{textAlign: 'left'}}>
              <span>{sourceField.defName}</span>
            </td>
            <td style={{textAlign: 'left'}}>
              <span>{sourceField.defKey && sourceField.type}</span>
            </td>
            <td style={{textAlign: 'right'}}>
              <span>{sourceField.defKey && sourceField.len}</span>
            </td>
            <td style={{textAlign: 'right'}}>
              <span>{sourceField.defKey && sourceField.scale}</span>
            </td>
            <td style={{textAlign: 'left'}} className={`${currentPrefix}-compare-list-container-content-list-item-comment`}>
              <span>{sourceField.comment}</span>
            </td>
            <td style={{textAlign: 'left'}}>
              <span>{metaField.defKey}</span>
            </td>
            <td style={{textAlign: 'left'}}>
              <span>{metaField.defName}</span>
            </td>
            <td style={{textAlign: 'left'}}>
              <span>{metaField.type}</span>
            </td>
            <td style={{textAlign: 'right'}}>
              <span>{metaField.len}</span>
            </td>
            <td style={{textAlign: 'right'}}>
              <span>{metaField.scale}</span>
            </td>
            <td style={{textAlign: 'left'}} className={`${currentPrefix}-compare-list-container-content-list-item-comment`}>
              <span>{metaField.comment}</span>
            </td>
          </tr>;
          });
    };
    const allEntitiesKeys = mergeMetaDataSourceKeys(dataSource.entities, metaData);
    const _checkBoxChange = (e, key) => {
        setSelectedTable((pre) => {
            if (e) {
                if (!e.target.checked) {
                    return pre.filter(p => p !== key);
                }
                return pre.concat(key);
            } else if (key === 'ind' || key === 'normal') {
                return metaData.map(d => d.defKey);
            }
            return [];
        });
    };
    // eslint-disable-next-line no-nested-ternary
    const type = selectedTable.length === metaData.length ? 'all' : ((selectedTable.length && selectedTable.length < metaData.length) ? 'ind' : 'normal');
    return <div style={style} className={`${currentPrefix}-compare-list`}>
      {meta ? <div className={`${currentPrefix}-compare-list-container`}>
        <div className={`${currentPrefix}-compare-list-container-header`}>
          <span>
            {
                  isCustomerMeta ? <Button disable={!meta} type='primary' onClick={extractData}>
                    <FormatMessage id='components.compare.extractMetadata'/>
                  </Button> : <><Button disable={!meta} type='primary' onClick={getTableList}>
                    <FormatMessage id='components.compare.scanTables'/>
                  </Button>
                    <Button onClick={() => getTableDetail()} disable={!meta || selectedTable.length === 0} type='primary'>
                      <FormatMessage id='components.compare.scanField'/>
                    </Button>
                    <Button onClick={() => showDDL()} disable={!meta || changes.length === 0} type='primary'>
                      <FormatMessage id='components.compare.ddl'/>
                    </Button></>
              }
          </span>
          <span>
            {
                  (isCustomerMeta ? metaDataSource : dbConn)
                      .filter(d => d.defKey === meta)[0]?.defName || meta
              }
          </span>
        </div>
        <div className={`${currentPrefix}-compare-list-container-content`}>
          {
                  metaData.length === 0 ? <div className={`${currentPrefix}-compare-list-container-content-empty`}>
                    <FormatMessage id={`components.compare.${isCustomerMeta ? 'extractedFirst' : 'scanTablesFirst'}`}/>
                  </div> : <div className={`${currentPrefix}-compare-list-container-content-list`}>
                    <table>
                      <thead>
                        <tr>
                          <td colSpan={3} style={{position: 'sticky', left: 0, zIndex: 3}}>
                            <span><FormatMessage id='components.compare.optOrResult'/></span>
                          </td>
                          <td colSpan={4}>
                            <span><FormatMessage id='components.compare.model'/></span>
                          </td>
                          <td>{}</td>
                          <td colSpan={4}><FormatMessage id={`components.compare.${isCustomerMeta ? 'customerMeta' : 'dbMeta'}`}/></td>
                        </tr>
                        <tr>
                          <td ref={firstRef} style={{position: 'sticky', left: 0, zIndex: 3}}>
                            {!isCustomerMeta && <span
                              className={`${currentPrefix}-listselect-opt-${type}`}
                              onClick={() => _checkBoxChange(null, type)}>
                                {}
                              </span>}
                          </td>
                          <td ref={secondRef} style={columnWidth[0] ? {position: 'sticky', left: columnWidth[0], zIndex: 3} : {}}>
                            <span><FormatMessage id='components.compare.view'/></span>
                          </td>
                          <td style={columnWidth[0] ? {position: 'sticky', left: columnWidth[0] + columnWidth[1], zIndex: 3} : {}}>
                            <span><FormatMessage id='components.compare.diffData'/></span>
                          </td>
                          <td>
                            <span><FormatMessage id='components.compare.code'/></span>
                          </td>
                          <td>
                            <span><FormatMessage id='components.compare.name'/></span>
                          </td>
                          <td>
                            <span><FormatMessage id='components.compare.comment'/></span>
                          </td>
                          <td>
                            <span><FormatMessage id='components.compare.fieldCount'/></span>
                          </td>
                          <td> <span><FormatMessage id='components.compare.opt'/></span></td>
                          <td>
                            <span><FormatMessage id='components.compare.code'/></span>
                          </td>
                          <td>
                            <span><FormatMessage id='components.compare.name'/></span>
                          </td>
                          <td>
                            <span><FormatMessage id='components.compare.comment'/></span>
                          </td>
                          <td>
                            <span><FormatMessage id='components.compare.fieldCount'/></span>
                          </td>
                        </tr>
                      </thead>
                      <tbody>
                        {allEntitiesKeys.map((d, i) => {
                              const sourceEntity = (dataSource.entities || [])
                                  .filter(e => e.defKey?.toLocaleLowerCase()
                                      === d?.toLocaleLowerCase())[0] || {};
                              const metaEntity = (metaData || [])
                                  .filter(e => e.defKey?.toLocaleLowerCase()
                                      === d?.toLocaleLowerCase())[0] || {};
                            const metaEntityData = (metaDataFields || [])
                                .filter(e => e.defKey?.toLocaleLowerCase()
                                    === d?.toLocaleLowerCase())[0] || {};
                            const [statusCom, status] = getStatus(sourceEntity, metaEntity);
                              return [<tr key={d} className={`${currentPrefix}-compare-list-container-content-list-item`}>
                                <td style={{position: 'sticky', left: 0, zIndex: 2}}>
                                  {
                                        !isCustomerMeta && <Checkbox
                                          disable={!metaEntity.defKey}
                                          onChange={e => _checkBoxChange(e, metaEntity.defKey)}
                                          checked={selectedTable.includes(metaEntity.defKey)}
                                        />
                                    }
                                  <span>{i + 1}</span>
                                </td>
                                <td style={columnWidth[0] ? {position: 'sticky', left: columnWidth[0], zIndex: 2} : {}}>
                                  {
                                      status === 'wait' ? '' : <a onClick={() => _setExpand(d)}>{FormatMessage.string({id: `components.compare.${expand.includes(d) ? 'fold' : 'view'}`})}</a>
                                    }
                                </td>
                                <td style={columnWidth[0] ? {position: 'sticky', left: columnWidth[0] + columnWidth[1], zIndex: 2} : {}}>
                                  {statusCom}
                                </td>
                                <td>
                                  <span>{sourceEntity.defKey}</span>
                                </td>
                                <td>
                                  <span>{sourceEntity.defName}</span>
                                </td>
                                <td className={`${currentPrefix}-compare-list-container-content-list-item-comment`}>
                                  <span>{sourceEntity.comment}</span>
                                </td>
                                <td style={{textAlign: 'right'}}>
                                  <span>{sourceEntity.fields?.length}</span>
                                </td>
                                <td>
                                  {
                                        metaEntity.defKey && <span>
                                          {!isCustomerMeta && <a
                                            onClick={() => getTableDetail(metaEntity.defKey)}
                                          >
                                            <FormatMessage id="components.compare.scan"/>
                                          </a>}
                                          {status !== 'wait' && <>{ !isCustomerMeta && (status !== 'same') && <span className={`${currentPrefix}-compare-list-container-content-list-item-line`}>{}</span>}
                                              {status !== 'same' && <a
                                                onClick={() => _mergeFromMeta(metaEntity.defKey)}
                                              >
                                                <FormatMessage
                                                  id="components.compare.mergeToModel"/>
                                              </a>}</>}
                                        </span>
                                    }
                                </td>
                                <td>
                                  <span>{metaEntity.defKey}</span>
                                </td>
                                <td>
                                  <span>{metaEntity.defName}</span>
                                </td>
                                <td className={`${currentPrefix}-compare-list-container-content-list-item-comment`}>
                                  <span>{metaEntity.comment}</span>
                                </td>
                                <td style={{textAlign: 'right'}}>
                                  <span>{metaEntityData.fields?.length}</span>
                                </td>
                              </tr>, <tr style={{display: expand.includes(d) ? 'table-row' : 'none'}} key={`${d}-1`} className={`${currentPrefix}-compare-list-container-content-list-item-child`}>
                                <td colSpan={10}>
                                  <table>
                                    <thead>
                                      <tr>
                                        <td />
                                        <td colSpan={6}>
                                          <span><FormatMessage id='components.compare.model'/></span>
                                        </td>
                                        <td colSpan={6}><FormatMessage id={`components.compare.${isCustomerMeta ? 'customerMeta' : 'dbMeta'}`}/></td>
                                      </tr>
                                      <tr>
                                        <td />
                                        <td>
                                          <span><FormatMessage id='components.compare.fieldCode'/></span>
                                        </td>
                                        <td>
                                          <span><FormatMessage id='components.compare.name'/></span>
                                        </td>
                                        <td>
                                          <span><FormatMessage id='components.compare.type'/></span>
                                        </td>
                                        <td>
                                          <span><FormatMessage id='components.compare.len'/></span>
                                        </td>
                                        <td>
                                          <span><FormatMessage id='components.compare.scale'/></span>
                                        </td>
                                        <td>
                                          <span><FormatMessage id='components.compare.comment'/></span>
                                        </td>
                                        <td>
                                          <span><FormatMessage id='components.compare.fieldCode'/></span>
                                        </td>
                                        <td>
                                          <span><FormatMessage id='components.compare.name'/></span>
                                        </td>
                                        <td>
                                          <span><FormatMessage id='components.compare.type'/></span>
                                        </td>
                                        <td>
                                          <span><FormatMessage id='components.compare.len'/></span>
                                        </td>
                                        <td>
                                          <span><FormatMessage id='components.compare.scale'/></span>
                                        </td>
                                        <td>
                                          <span><FormatMessage id='components.compare.comment'/></span>
                                        </td>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {expand.includes(d) &&
                                          getChildren(sourceEntity, metaEntityData)}
                                    </tbody>
                                  </table>
                                </td>
                              </tr>];
                          })}
                      </tbody>
                    </table>
                  </div>
              }
        </div>
      </div> :
      <div className={`${currentPrefix}-compare-list-container-content-empty`}>
        <FormatMessage id='components.compare.selectedFirst'/>
      </div>}
    </div>;
}));
