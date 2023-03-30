import React from 'react';

import './style/index.less';
import {FormatMessage, Radio} from 'components';
import {getPrefix} from '../../../../lib/prefixUtil';

export default ({prefix, type, onChange}) => {
    const currentPrefix = getPrefix(prefix);
    return <div className={`${currentPrefix}-export-img`}>
      <div className={`${currentPrefix}-form-item`}>
        <span
          className={`${currentPrefix}-form-item-label`}
          title={FormatMessage.string({id: 'exportImg.type'})}
      >
          <FormatMessage id='exportImg.type'/>
        </span>
        <span className={`${currentPrefix}-form-item-component ${currentPrefix}-export-img-type`}>
          <Radio.RadioGroup
            onChange={e => onChange(e, 'type')}
            defaultValue={type}
          >
            <Radio value='svg'>
              <span>
                svg
              </span>
            </Radio>
            <Radio value='png'>
              <span>
                png
              </span>
            </Radio>
          </Radio.RadioGroup>
        </span>
      </div>
    </div>;
};
