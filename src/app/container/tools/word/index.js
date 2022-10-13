import React, { useRef } from 'react';
import * as _ from 'lodash/object';

import {FormatMessage, Icon, Message} from 'components';
import DocTemplate from '../../config/DocTemplate';
import './style/index.less';
import {getPrefix} from '../../../../lib/prefixUtil';
import { saveAsTemplate } from '../../../../lib/middle';

export default React.memo(({prefix, dataSource, onOk, save, projectInfo}) => {
    const currentPrefix = getPrefix(prefix);
    const path = 'profile.generatorDoc.docTemplate';
    const defaultTemplate = _.get(dataSource, path);
    const fileRef = useRef(defaultTemplate);
    const fileTempRef = useRef(defaultTemplate);
    const dataChange = (value) => {
        fileTempRef.current = value;
    };
    const _onOk = () => {
        save(_.set(dataSource, path, fileTempRef.current), FormatMessage.string({id: 'saveProject'}), !projectInfo, (err) => {
            if (!err) {
                Message.success({title: FormatMessage.string({id: 'saveSuccess'})});
            } else {
                Message.error({title: `${FormatMessage.string({id: 'saveFail'})}:${err?.message}`});
            }
        });
        fileRef.current = fileTempRef.current;
    };
    return <div className={`${currentPrefix}-export-word`}>
      <div className={`${currentPrefix}-export-word-export`}>
        <span
          onClick={() => onOk(fileRef.current)}
          className={`${currentPrefix}-export-word-export-button`}
        >
          <FormatMessage id='word.exportWord'/>
        </span>
      </div>
      <div className={`${currentPrefix}-export-word-template`}>
        <div>
          <div><FormatMessage id='word.template'/></div>
          <div>{}</div>
        </div>
        <div>
          <div><DocTemplate dataSource={dataSource} dataChange={dataChange} onOk={_onOk}/></div>
          <div>
            <Icon type='fa-file-word-o'/>
            <a onClick={() => saveAsTemplate('PDManer-docx-tpl', 'docx')}><FormatMessage id='word.download'/></a>
          </div>
        </div>
      </div>
    </div>;
});
