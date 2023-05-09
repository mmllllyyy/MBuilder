import React, {useEffect, useState} from 'react';

import './style/index.less';
import moment from 'moment';
import {Button, FormatMessage, openModal, Modal, Message} from 'components';
import { getPrefix } from '../../../../lib/prefixUtil';
import { getBackupAllFileData, readJsonPromise, deleteFile, getFilePath } from '../../../../lib/middle';
import Log from './Log';

export default React.memo(({prefix, info, data, openLoading, closeLoading,
                               updateProject, close}) => {
    const currentPrefix = getPrefix(prefix);
    const [historyOpt, setHistoryOpt] = useState([]);
    const showLog = (files) => {
        let modal;
        const onCancel = () => {
            modal && modal.close();
        };
        modal = openModal(<Log
          files={files}
        />, {
            buttons:  [
              <Button key='cancel' onClick={onCancel}>
                <FormatMessage id='button.close'/>
              </Button>],
            title: FormatMessage.string({id: 'toolbar.history'}),
        });
    };
    const reset = (h) => {
        Modal.confirm({
            title: FormatMessage.string({id: 'operationsHistory.resetTitle'}),
            message: FormatMessage.string({id: 'operationsHistory.resetMessage'}),
            onOk:() => {
                openLoading();
                readJsonPromise(h.path).then((d) => {
                    updateProject(d);
                    Message.success({title: FormatMessage.string({id: 'operationsHistory.resetSuccess'})});
                    close();
                }).finally(() => {
                    closeLoading();
                });
            },
        });
    };
    const onDelete = (h) => {
        Modal.confirm({
            title: FormatMessage.string({id: 'operationsHistory.deleteTitle'}),
            message: FormatMessage.string({id: 'operationsHistory.deleteMessage'}),
            onOk:() => {
                deleteFile(h.path);
                Message.success({title: FormatMessage.string({id: 'operationsHistory.deleteSuccess'})});
                setHistoryOpt(pre => pre.filter(p => p.file !== h.file));
            },
        });
    };
    const openWindow = (h) => {
        window.open(getFilePath(encodeURI(h.path)), '', 'width=1220');
    };
    useEffect(() => {
        openLoading();
        getBackupAllFileData({info, data}, (d) => {
            setHistoryOpt(d);
            closeLoading();
        });
    }, []);
    return <div className={`${currentPrefix}-history`}>
      {
            historyOpt.map((h, i) => {
                return <div key={h.file} className={`${currentPrefix}-history-item`}>
                  <span>
                    <span>
                      {h.file}
                    </span>
                    <span>
                      {moment(h.file.match(/(\d)+/)[0], 'YYYYMMDDHHmmss').format('YYYY/MM/DD HH:mm:ss')}
                    </span>
                  </span>
                  <span>
                    <span onClick={() => openWindow(h)}>{FormatMessage.string({id: 'operationsHistory.openWindow'})}</span>
                    <span onClick={() => showLog([historyOpt[i + 1], h])}>{FormatMessage.string({id: 'operationsHistory.log'})}</span>
                    <span onClick={() => reset(h)}>{FormatMessage.string({id: 'operationsHistory.reset'})}</span>
                    <span onClick={() => onDelete(h)}>{FormatMessage.string({id: 'operationsHistory.delete'})}</span>
                  </span>
                </div>;
            })
        }
      {historyOpt.length === 0 ? FormatMessage.string({id: 'operationsHistory.emptyHistory'}) : ''}
    </div>;
});
