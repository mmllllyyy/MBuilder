import React, {useRef, useState} from 'react';
import {Radio, FormatMessage, Icon, Input, Upload, Tooltip} from 'components';
import {getPrefix} from '../../lib/prefixUtil';

export default React.memo(({prefix, data = {type: 'URL'}, dataChange}) => {
    const currentPrefix = getPrefix(prefix);
    const [file, setFile] = useState(data.file || '');
    const [type, setType] = useState(data.type);
    const dataRef = useRef({...data});
    const uploadJson = () => {
        Upload('application/json', (f) => {
            setFile(f.path);
            dataRef.current.file = f.path;
            dataChange && dataChange(dataRef.current);
        }, () => true, false);
    };
    const onChange = (e, t) => {
        if (t === 'type') {
            setType(e.target.value);
        }
        dataRef.current[t] = e.target.value;
        dataChange && dataChange(dataRef.current);
    };
    return <div className={`${currentPrefix}-compare-meta-edit`}>
      <div className={`${currentPrefix}-form-item`}>
        <span
          className={`${currentPrefix}-form-item-label`}
          title={FormatMessage.string({id: 'components.compare.metaName'})}
      >
          <span className={`${currentPrefix}-form-item-label-require`}>{}</span>
          <FormatMessage id='components.compare.metaName'/>
        </span>
        <span className={`${currentPrefix}-form-item-component`}>
          <Input
            defaultValue={data.defName || ''}
            placeholder={FormatMessage.string({id: 'components.compare.metaNamePlaceholder'})}
            onChange={e => onChange(e, 'defName')}
        />
        </span>
      </div>
      <div className={`${currentPrefix}-form-item`}>
        <span
          className={`${currentPrefix}-form-item-label`}
          title={FormatMessage.string({id: 'components.compare.metaType'})}
        >
          <span className={`${currentPrefix}-form-item-label-require`}>{}</span>
          <FormatMessage id='components.compare.metaType'/>
          <Tooltip placement='top' title={FormatMessage.string({id: 'components.compare.customerMetaHelp'})} force>
            <span className={`${currentPrefix}-form-item-label-help`}>
              <Icon type='icon-xinxi'/>
            </span>
          </Tooltip>
        </span>
        <span className={`${currentPrefix}-form-item-component`}>
          <Radio.RadioGroup
            onChange={e => onChange(e, 'type')}
            defaultValue={data.type}
          >
            <Radio value='URL'>
              <span>
                <FormatMessage id='components.compare.URL'/>
              </span>
            </Radio>
            <Radio value='FILE'>
              <span>
                <FormatMessage id='components.compare.FILE'/>
              </span>
            </Radio>
          </Radio.RadioGroup>
        </span>
      </div>
      {
            type === 'URL' ? <div className={`${currentPrefix}-form-item`}>
              <span
                className={`${currentPrefix}-form-item-label`}
                title={FormatMessage.string({id: 'components.compare.takeURL'})}
        >
                <span className={`${currentPrefix}-form-item-label-require`}>{}</span>
                <FormatMessage id='components.compare.takeURL'/>
              </span>
              <span className={`${currentPrefix}-form-item-component`}>
                <Input
                  defaultValue={data.url || ''}
                  placeholder={FormatMessage.string({id: 'components.compare.takeURLPlaceholder'})}
                  onChange={e => onChange(e, 'url')}
          />
              </span>
            </div> : <div className={`${currentPrefix}-form-item`}>
              <span
                className={`${currentPrefix}-form-item-label`}
                title={FormatMessage.string({id: 'components.compare.takeFILE'})}
        >
                <span className={`${currentPrefix}-form-item-label-require`}>{}</span>
                <FormatMessage id='components.compare.takeFILE'/>
              </span>
              <span className={`${currentPrefix}-form-item-component`}>
                <Input
                  placeholder={FormatMessage.string({id: 'components.compare.takeFILEPlaceholder'})}
                  value={file}
                  readOnly
                  suffix={<span className={`${currentPrefix}-setting-java-home-opt`}>
                    <Icon type='fa-ellipsis-h' onClick={uploadJson} title={FormatMessage.string({id: 'components.compare.takeFILE'})}/>
                  </span>}
          />
              </span>
            </div>
        }
    </div>;
});
