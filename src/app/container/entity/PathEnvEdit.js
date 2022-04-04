import React, { forwardRef, useImperativeHandle, useState, useRef } from 'react';
import {Input, FormatMessage, Icon, Modal, Tooltip, openModal, Button} from 'components';

import {getPrefix} from '../../../lib/prefixUtil';
import {openFileOrDirPath} from '../../../lib/middle';
import { camel } from '../../../lib/json2code_util';
import PickDir from './PickDir';

export default React.memo(forwardRef(({prefix, data, config, template, dataSource}, ref) => {
    const envData = data?.env || {};
    const currentPrefix = getPrefix(prefix);
    const [env, setEnv] = useState(() => {
        const d = envData.base || {};
        return {
            ...d,
            codeRoot: d.codeRoot || camel(data.defKey, true) || '',
        };
    });
    const [templateEnv, setTemplateEnv] = useState(template.map((t) => {
        const tData = envData.template || {};
        return {
            name: t,
            suffix: tData[t]?.suffix || '',
        };
    }));
    const [customerEnv, setCustomerEnv] = useState(() => {
        return Object.keys(envData.custom || {}).map(e => ({
                id: Math.uuid(),
                name: e,
                value: (envData.custom || {})[e],
            }));
    });
    const [path, setPath] = useState((config.path || {})[data.id]);
    const envRef = useRef(null);
    envRef.current = env;
    const templateEnvRef = useRef(null);
    templateEnvRef.current = templateEnv;
    const customerEnvRef = useRef(null);
    customerEnvRef.current = customerEnv;
    const pathRef = useRef(null);
    pathRef.current = path;
    useImperativeHandle(ref, () => {
        return {
            getData(){
                return {
                    base: envRef.current,
                    template: templateEnvRef.current
                        .filter(e => e.suffix).reduce((a, b) => {
                        return {
                            ...a,
                            [b.name]: {suffix: b.suffix},
                        };
                    }, {}),
                    custom: customerEnvRef.current.filter(e => e.name || e.value).reduce((a, b) => {
                        return {
                            ...a,
                            [b.name]: b.value,
                        };
                    }, {}),
                };
            },
            getPath(){
                return pathRef.current;
            },
        };
    }, []);
    const selectDir = () => {
        openFileOrDirPath([], ['openDirectory'], {defaultPath: pathRef.current}).then((res) => {
            setPath(res);
        }).catch((err) => {
            Modal.error({
                title: FormatMessage.string({id: 'openDirError'}),
                message: err.message || err,
            });
        });
    };
    const onPtahChange = (e) => {
        setPath(e.target.value);
    };
    const onCustomerEnvChange = (value, id, name) => {
        setCustomerEnv(pre => pre.map((p) => {
            if (id === p.id) {
               return {
                   ...p,
                   [name]: value,
               };
            }
            return p;
        }));
    };
    const onEnvChange = (value, name) => {
        setEnv((pre) => {
            return {
                ...pre,
                [name]: value,
            };
        });
    };
    const addEnv = () => {
        setCustomerEnv(pre => pre.concat({
            id: Math.uuid(),
            name: '',
            key: '',
        }));
    };
    const deleteEnv = (id) => {
        setCustomerEnv(pre => pre.filter(p => p.id !== id));
    };
    const templateEnvChange = (value, name, id) => {
        setTemplateEnv(pre => pre.map((p) => {
            if (p.name === id) {
                return {
                    ...p,
                    [name]: value,
                };
            }
            return p;
        }));
    };
    const selectOther = () => {
        let modal;
        let select;
        const onCancel = () => {
            modal.close();
        };
        const onOK = () => {
            setPath(select || '');
            modal.close();
        };
        const onSelected = (p) => {
            select = p;
        };
        modal = openModal(<PickDir
          onSelected={onSelected}
          config={config}
          dataSource={dataSource}
        />, {
            bodyStyle: {width: '60%'},
            title: FormatMessage.string({id: 'tableBase.savePathFromOther'}),
            buttons: [
              <Button type='primary' key='ok' onClick={onOK}>{FormatMessage.string({id: 'button.ok'})}</Button>,
              <Button key='cancel' onClick={onCancel}>{FormatMessage.string({id: 'button.cancel'})}</Button>],
        });
    };
    return <div className={`${currentPrefix}-form`}>
      <div>
        <div className={`${currentPrefix}-datatype-title`}>
          <span>{}</span>
          <span>{FormatMessage.string({id: 'tableBase.baseConfig'})}</span>
        </div>
        <div>
          <div className={`${currentPrefix}-form-item`}>
            <span
              className={`${currentPrefix}-form-item-label`}
              title={FormatMessage.string({id: 'tableBase.savePath'})}>
              {FormatMessage.string({id: 'tableBase.savePath'})}
            </span>
            <span className={`${currentPrefix}-form-item-component ${currentPrefix}-entity-template-component`}>
              <Input
                placeholder={FormatMessage.string({id: 'tableBase.savePathPlaceHolder'})}
                onChange={onPtahChange}
                value={path}
                suffix={<span className={`${currentPrefix}-setting-java-home-opt`}>
                  <Icon type='fa-ellipsis-h' onClick={selectDir} title={FormatMessage.string({id: 'tableBase.select'})}/>
                  <span onClick={selectOther}><FormatMessage id='tableBase.savePathFromOther'/></span>
                </span>}
              />
            </span>
          </div>
          <div className={`${currentPrefix}-form-item`}>
            <span
              className={`${currentPrefix}-form-item-label`}
              title={FormatMessage.string({id: 'tableBase.nameSpace'})}
            >
              <FormatMessage id='tableBase.nameSpace'/>
            </span>
            <span className={`${currentPrefix}-form-item-component`}>
              <Input
                placeholder={FormatMessage.string({id: 'tableBase.nameSpacePlaceHolder'})}
                value={env.nameSpace || ''}
                onChange={e => onEnvChange(e.target.value, 'nameSpace')}
              />
            </span>
          </div>
          <div className={`${currentPrefix}-form-item`}>
            <span
              className={`${currentPrefix}-form-item-label`}
              title={FormatMessage.string({id: 'tableBase.codeRoot'})}
            >
              <FormatMessage id='tableBase.codeRoot'/>
            </span>
            <span className={`${currentPrefix}-form-item-component`}>
              <Input
                placeholder={FormatMessage.string({id: 'tableBase.codeRootPlaceHolder'})}
                value={env.codeRoot || ''}
                onChange={e => onEnvChange(e.target.value, 'codeRoot')}
              />
            </span>
          </div>
        </div>
      </div>
      <div>
        <div className={`${currentPrefix}-datatype-title`} style={{width: '100%'}}>
          <span>{}</span>
          <span className={`${currentPrefix}-entity-template-title`}>
            <span>
              {FormatMessage.string({id: 'tableBase.templateConfig'})}
            </span>
            <Tooltip
              placement='top'
              title={
                <div style={{padding: 10}} className={`${currentPrefix}-entity-template-pickdir`}>
                  <div> {FormatMessage.string({id: 'tableBase.example'})}</div>
                  <table>
                    <thead>
                      <tr>
                        <td>{}</td>
                        <td>{}</td>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Controller:</td>
                        <td>{'controller/{{=it.codeRoot}}Controller.java'}</td>
                      </tr>
                      <tr>
                        <td>Service:</td>
                        <td>{'service/{{=it.codeRoot}}Service.java'}</td>
                      </tr>
                      <tr>
                        <td>ServiceImpl:</td>
                        <td>{'service/impl/{{=it. codeRoot}}ServiceImpl.java'}</td>
                      </tr>
                      <tr>
                        <td>Mapper.xml:</td>
                        <td>{'mapper/{{=it.codeRoot}}Mapper.xml'}</td>
                      </tr>
                      <tr>
                        <td>Mapper:</td>
                        <td>{'mapper/{{=it.codeRoot}}Mapper.java'}</td>
                      </tr>
                      <tr>
                        <td>Entity:</td>
                        <td>{'entity/{{=it.codeRoot}}Entity.java'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
            }
              force>
              <span className={`${currentPrefix}-form-item-label-help`}>
                <Icon type='icon-xinxi'/>
              </span>
            </Tooltip>
          </span>
        </div>
        <div className={`${currentPrefix}-entity-template-container`}>
          <div>
            <div>{FormatMessage.string({id: 'tableBase.template'})}</div>
            <div style={{textAlign: 'left'}}>{FormatMessage.string({id: 'tableBase.suffix'})}</div>
          </div>
          {templateEnv.map((t) => {
                return <div key={t.name}>
                  <div>{t.name}</div>
                  <div>
                    <Input
                      placeholder='demo/entity/{{=it.codeRoot}}Entity.java'
                      onChange={e => templateEnvChange(e.target.value, 'suffix', t.name)}
                      value={t.suffix}
                    />
                  </div>
                </div>;
            })}
        </div>
      </div>
      <div>
        <div className={`${currentPrefix}-datatype-title`}>
          <span>{}</span>
          <span>{FormatMessage.string({id: 'tableBase.customEnv'})}</span>
        </div>
        <div className={`${currentPrefix}-entity-env-container`}>
          {
              customerEnv.map((e) => {
                    return <div className={`${currentPrefix}-entity-env`} key={e.id}>
                      <Input
                        onChange={ev => onCustomerEnvChange(ev.target.value, e.id, 'name')}
                        value={e.name}
                        />
                      <span style={{margin: '0 10px'}}>=</span>
                      <Input
                        onChange={ev => onCustomerEnvChange(ev.target.value, e.id, 'value')}
                        value={e.value}
                        />
                      <Icon onClick={() => deleteEnv(e.id)} style={{marginLeft: 10}} type='fa-minus'/>
                    </div>;
                })
            }
          <div onClick={addEnv}>
            <Icon type='fa-plus' style={{marginRight: 10}}/>
            <FormatMessage id='tableBase.add'/>
          </div>
        </div>
      </div>
    </div>;
}));
