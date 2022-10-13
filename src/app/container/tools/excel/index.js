import React from 'react';

import { Icon, FormatMessage } from 'components';
import './style/index.less';
import {getPrefix} from '../../../../lib/prefixUtil';
import {saveAsTemplate} from '../../../../lib/middle';

export default React.memo(({prefix, onPicker}) => {
    const currentPrefix = getPrefix(prefix);
    return <div className={`${currentPrefix}-import-excel`}>
      <div onClick={onPicker} className={`${currentPrefix}-import-excel-upload`}>
        <span
          className={`${currentPrefix}-import-excel-upload-button`}
            >
          {FormatMessage.string({id: 'excel.importExcel'})}
        </span>
      </div>
      <div className={`${currentPrefix}-import-excel-template`}>
        <div>
          <div>{FormatMessage.string({id: 'excel.template'})}</div>
          <div>{}</div>
        </div>
        <div>
          <Icon type='fa-file-excel-o'/>
          <a onClick={() => saveAsTemplate('PDManer-excel-tpl', 'xlsx')}>{FormatMessage.string({id: 'excel.download'})}</a>
        </div>
      </div>
    </div>;
});
