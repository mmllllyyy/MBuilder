import React, { useState, useRef } from 'react';
import {FormatMessage, Radio, Text, Tree} from 'components';
import {getPrefix} from '../../lib/prefixUtil';

export default React.memo(({prefix, data, onChange, getDataSource}) => {
  const dataRef = useRef({...data});
  const dataSource = useRef(getDataSource());
  const [type, setType] = useState(data.type);
    const _onChange = (e, t) => {
      if (t === 'type') {
        setType(e.target.value);
        dataRef.current = {
          type: e.target.value,
          value: '',
        };
      } else {
        dataRef.current.value = e?.target?.value || e[0];
      }
      onChange && onChange(dataRef.current);
    };
    const currentPrefix = getPrefix(prefix);
    return <div className={`${currentPrefix}-relation-link`}>
      <div className={`${currentPrefix}-form-item`}>
        <span
          className={`${currentPrefix}-form-item-label`}
          title={FormatMessage.string({id: 'canvas.node.linkType'})}
        >
          <span className={`${currentPrefix}-form-item-label-require`}>{}</span>
          <FormatMessage id='canvas.node.linkType'/>
        </span>
        <span className={`${currentPrefix}-form-item-component ${currentPrefix}-relation-link-type`}>
          <Radio.RadioGroup
            onChange={e => _onChange(e, 'type')}
            defaultValue={data.type}
          >
            <Radio value='internally'>
              <span>
                <FormatMessage id='canvas.node.internally'/>
              </span>
            </Radio>
            <Radio value='externally'>
              <span>
                <FormatMessage id='canvas.node.externally'/>
              </span>
            </Radio>
            <Radio value=''>
              <span>
                <FormatMessage id='canvas.node.linkNone'/>
              </span>
            </Radio>
          </Radio.RadioGroup>
        </span>
      </div>
      {
        type === 'externally' && <div className={`${currentPrefix}-form-item`}>
          <span
            className={`${currentPrefix}-form-item-label`}
            title={FormatMessage.string({id: 'canvas.node.linkAddress'})}
        >
            <span className={`${currentPrefix}-form-item-label-require`}>{}</span>
            <FormatMessage id='canvas.node.linkAddress'/>
          </span>
          <span className={`${currentPrefix}-form-item-component ${currentPrefix}-relation-link-type`}>
            <Text
              placeholder={FormatMessage.string({id: 'canvas.node.linkAddressPlaceholder'})}
              onChange={e => _onChange(e, 'value')}
              defaultValue={dataRef.current.value}
          />
          </span>
          </div>

      }
      {
          type === 'internally' && <div className={`${currentPrefix}-form-item`}>
            <span
              className={`${currentPrefix}-form-item-label`}
              title={FormatMessage.string({id: 'canvas.node.linkContent'})}
          >
              <span className={`${currentPrefix}-form-item-label-require`}>{}</span>
              <FormatMessage id='canvas.node.linkContent'/>
            </span>
            <span className={`${currentPrefix}-form-item-component`}>
              <div className={`${currentPrefix}-relation-link-tree`}>
                <Tree
                  defaultCheckeds={[dataRef.current.value]}
                  simpleChecked
                  placeholder={FormatMessage.string({id: 'canvas.node.linkSearch'})}
                  dataSource={['entities', 'views', 'diagrams', 'dicts'].map((v) => {
                      return {
                        key: v,
                        value: FormatMessage.string({id: `project.${v === 'diagrams' ? 'diagram' : v}`}),
                        children: (dataSource.current?.[v] || []).map(e => ({
                          key: e.id,
                          value: `${e.defKey}-${e.defName}`,
                        })),
                      };
                    })}
                  onChange={value => _onChange(value, 'value')}
                />
              </div>
            </span>
          </div>

      }
    </div>;
});
