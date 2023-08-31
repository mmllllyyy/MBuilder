import React, {useState, useMemo, forwardRef, useImperativeHandle, useRef, useEffect} from 'react';
import _ from 'lodash/object';

import './style/index.less';
import {getPrefix} from '../../lib/prefixUtil';
import Left from './Left';
import Right from './Right';
import {unRepeated} from '../../lib/array_util';

export default React.memo(forwardRef(({allowClear = false, notAllowEmpty = true,
                                        data, groups, prefix, formatResult, arrayData,
                                        defaultSelected = []}, ref) => {
  const tempSelected = unRepeated(defaultSelected);
  const searchDataRef = useRef([]);
  const currentPrefix = getPrefix(prefix);
  const currentGroup = useMemo(() => {
    return groups
        .concat(data
            .filter(d => groups.findIndex(g => g.id === d.id) < 0)
            .map(g => ({...g, fields: []})));
  },[groups]);
  const newData = useMemo(() => data.reduce((a, b) => {
    return a.concat(b.fields.map(f => ({...f, group: b.id})));
  }, []), [data]);
  const currentData = arrayData || groups.reduce((a, b) => a.concat(b.fields), [groups]);
  const newDataKeys = useMemo(() => newData.map(n => n.id), [newData]);
  const repeatData = useMemo(() => currentData.map(f => f.defKey)
      .filter(f => newData.map(n => n.defKey).includes(f)), [data, groups]);
  const [checked, setChecked] = useState([...tempSelected]);
  const [type, setType] = useState('normal');
  const groupDataRef = useRef({});
  const getType = (d) => {
    if(d.every(s => checked.includes(s.id))) {
      return 'all';
    } else if(d.some(s => checked.includes(s.id))) {
      return 'ind';
    } else {
      return 'normal';
    }
  };
  useEffect(() => {
    setType(getType(searchDataRef.current));
  }, [checked]);
  useEffect(() => {
    setChecked([...tempSelected]);
  }, [newDataKeys]);
  const checkedRef = useRef(null);
  checkedRef.current = checked;
  const importDataRef = useRef([...newData]);
  importDataRef.current = [...newData];
  useImperativeHandle(ref, () => {
    return {
      getData: () => {
        const current = importDataRef.current.filter(f => checkedRef.current.includes(f.id));
        return currentGroup.map((g) => {
          const currentFields = current
              .filter(c => c.group === g.id)
              .map(c => _.omit(c, ['group']));
          return {
            ...g,
            fields: g.fields
                .filter(f => currentFields.findIndex(c => c.id === f.id) < 0)
                .concat(currentFields),
          };
        });
      },
    };
  }, []);
  const _iconClick = (t) => {
    if (t === 'all') {
      setChecked((pre) => {
        return [...new Set([...tempSelected || []]
            .concat(pre.filter(p => searchDataRef.current.findIndex(d => d.id === p) < 0)))];
      });
    } else {
      setChecked((pre) => {
        return [...new Set(pre.concat(searchDataRef.current.map(d => d.id)))];
      });
    }
  };
  const _onGroupChange = (e, id) => {
    const ids = [].concat(id);
    ids.forEach((i) => {
      groupDataRef.current[i] = e.target.value;
    });
    importDataRef.current = importDataRef.current.map((f) => {
      if (f.id === id) {
        return {
          ...f,
          group: e.target.value,
        };
      }
      return {
        ...f,
        group: groupDataRef.current[f.id],
      };
    });
  };
  const onRemove = (keys) => {
    setChecked((pre) => {
      return pre.filter(p => !keys.includes(p));
    });
  };
  const _checkBoxChange = (e, id) => {
    setChecked((pre) => {
      if (!e.target.checked) {
        return pre.filter(p => p !== id);
      }
      return pre.concat(id);
    });
  };
  const onSearch = (searchData) => {
    setType(getType(searchData));
    searchDataRef.current = searchData;
  };
  const checkNewData = useMemo(() => newData.filter(d => checked.includes(d.id)),
      [checked, newData]);
  return <div className={`${currentPrefix}-listselect`}>
    <div className={`${currentPrefix}-listselect-opt`}>
      <span>{formatResult && formatResult(newData, repeatData)}</span>
    </div>
    <div className={`${currentPrefix}-listselect-container`}>
      <Left
        header={<span className={`${currentPrefix}-listselect-opt-${type}`} onClick={() => _iconClick(type)}>
          {}
        </span>}
        defaultSelected={tempSelected}
        prefix={currentPrefix}
        checked={checked}
        newData={newData}
        checkBoxChange={_checkBoxChange}
        repeatData={repeatData}
        onSearch={onSearch}
      />
      <Right
        defaultSelected={tempSelected}
        currentGroup={currentGroup}
        newData={checkNewData}
        prefix={currentPrefix}
        onGroupChange={_onGroupChange}
        onRemove={onRemove}
        allowClear={allowClear}
        notAllowEmpty={notAllowEmpty}
      />
    </div>
  </div>;
}));
