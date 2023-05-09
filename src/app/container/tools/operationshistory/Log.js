import React, { useEffect, useState } from 'react';
import {FormatMessage} from 'components';
import {readJsonPromise} from '../../../../lib/middle';
import {
    getMessageByChanges,
    packageChanges,
} from '../../../../lib/datasource_version_util';
import {getPrefix} from '../../../../lib/prefixUtil';

export default React.memo(({files, prefix}) => {
    const [data, setData] = useState('');
    useEffect(() => {
        Promise.all(files
            .filter(f => !!f)
            .map(f => readJsonPromise(f.path))).then((result) => {
                const pre = result[1] ? result[0] : {entities: [], views: []};
                const curr = result[1] || result[0];
                const changes = packageChanges(curr, pre);
                if(changes.length === 0) {
                    setData('');
                } else {
                    setData(getMessageByChanges(changes, curr));
                }
        });
    }, []);
    const currentPrefix = getPrefix(prefix);
    return <pre className={`${currentPrefix}-history-log`}>
      {data || <div style={{textAlign: 'center'}}>{FormatMessage.string({id: 'operationsHistory.emptyLog'})}</div>}
    </pre>;
});
