import React, { useState, useEffect } from 'react';
import {Checkbox, FormatMessage, SearchInput} from 'components';

const Item = React.memo(({prefix, repeatData, checkBoxChange, checked, d, i, defaultSelected}) => {
  return <tr
    className={`${prefix}-listselect-left-item ${prefix}-listselect-left-item-${repeatData.includes(d.defKey) ? 'repeat' : 'normal'}`}
    key={d.id}
  >
    <td>{i + 1}</td>
    <td>
      <Checkbox
        disable={(defaultSelected || []).includes(d.id)}
        onChange={e => checkBoxChange(e, d.id)}
        checked={checked.includes(d.id)}
    >
        {`${d.defKey}[${d.defName || d.defKey}]`}{repeatData.includes(d.defKey) ? <div>[{FormatMessage.string({id: 'components.listSelect.repeatMessage'})}]</div> : ''}
      </Checkbox></td>
  </tr>;
}, (pre, next) => {
  return (pre.checked.includes(pre.d.id) && next.checked.includes(next.d.id)) ||
      (!pre.checked.includes(pre.d.id) && !next.checked.includes(next.d.id));
});

export default React.memo(({prefix, newData, checkBoxChange,
                             repeatData, checked, defaultSelected, onSearch}) => {
  const [filterData, setFilterData] = useState([]);
  useEffect(() => {
    setFilterData(newData);
  }, [newData]);
  const _onChange = (e) => {
    const value = e.target.value || '';
    setFilterData(() => {
      const reg = new RegExp((value).replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
      return newData.filter(d => (!!d.defKey)
          && (reg.test(d.defKey || '') || reg.test(d.defName || '')));
    });
  };
  useEffect(() => {
    onSearch(filterData);
  }, [filterData]);
  return <div className={`${prefix}-listselect-left`}>
    <div className={`${prefix}-listselect-left-search`}>
      <SearchInput
        placeholder={FormatMessage.string({id: 'components.listSelect.search'})}
        onChange={_onChange}
      />
    </div>
    <div className={`${prefix}-listselect-left-container`}>
      <table>
        <tbody>
          {
            filterData.map((d, i) => {
            return <Item
              defaultSelected={defaultSelected}
              i={i}
              prefix={prefix}
              key={`${d.id}${i}`}
              d={d}
              checkBoxChange={checkBoxChange}
              repeatData={repeatData}
              checked={checked}
            />;
          })
        }
        </tbody>
      </table>
    </div>
  </div>;
});
