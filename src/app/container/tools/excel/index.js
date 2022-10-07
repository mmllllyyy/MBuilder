import React from 'react';

import { Icon, FormatMessage } from 'components';
import './style/index.less';
import {getPrefix} from '../../../../lib/prefixUtil';

export default React.memo(({prefix}) => {
    const currentPrefix = getPrefix(prefix);
    return <div className={`${currentPrefix}-import-excel`}>
      <div className={`${currentPrefix}-import-excel-upload`}>
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
          <a>{FormatMessage.string({id: 'excel.download'})}</a>
        </div>
      </div>
    </div>;
});
