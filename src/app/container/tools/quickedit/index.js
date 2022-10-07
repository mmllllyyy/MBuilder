import React, {useRef, useState} from 'react';
import {FormatMessage, Input, Icon} from 'components';

import {getPrefix} from '../../../../lib/prefixUtil';
import { allType } from '../../../../lib/datasource_util';
import SelectGroup from '../../group/SelectGroup';
import {separator} from '../../../../../profile';
import './style/index.less';

export default React.memo(({ prefix, dataSource, dataChange, dataType }) => {
    const [selected, setSelected] = useState([]);
    const [currentSort, setCurrentSort] = useState('defKey');
    const [sort, setSort] = useState({defKey: 'desc', defName: 'desc'});
    const [viewGroups, setViewGroups] = useState(dataSource?.viewGroups || []);
    const dataSourceRef = useRef({...dataSource});
    const name = allType.filter(t => t.type === dataType)[0]?.name || dataType;
    const currentPrefix = getPrefix(prefix);
    const refNames = `ref${name.replace(/\b(\w)(\w*)/g, ($0, $1, $2) => {
        return $1.toUpperCase() + $2.toLowerCase();
    })}`;
    const getGroup = (dataKey) => {
        return viewGroups
            .filter(v => v[refNames]
                ?.includes(dataKey))
            .map(v => v.id);
    };
    const _dataChange = (value, fieldName, id) => {
      if (fieldName === 'group') {
          const tempViewGroups = (dataSourceRef.current.viewGroups || []).map((d) => {
              if (value.includes(d.id)) {
                  return {
                      ...d,
                      [refNames]: [...new Set(d[refNames].concat(id).concat(selected))],
                  };
              }
              return {
                  ...d,
                  [refNames]: (d[refNames] || [])
                      .filter(refId => !(selected.concat(id)).includes(refId)),
              };
          });
          setViewGroups(tempViewGroups);
          dataSourceRef.current = {
              ...dataSourceRef.current,
              viewGroups: tempViewGroups,
          };
          dataChange && dataChange(dataSourceRef.current);
      } else {
          dataSourceRef.current = {
              ...dataSourceRef.current,
              [name]: (dataSourceRef.current[name] || []).map((d) => {
                  if (d.id === id) {
                      return {
                          ...d,
                          [fieldName]: value,
                      };
                  }
                  return d;
              }),
          };
          dataChange && dataChange(dataSourceRef.current);
      }
    };
    const onNoClick = (e, id, ind) => {
        if (e.ctrlKey || e.metaKey){
            setSelected((pre) => {
                if (pre.includes(id)) {
                    return pre.filter(i => i !== id);
                }
                return pre.concat(id);
            });
        } else if (e.shiftKey) {
            const min = selected
                .sort((a, b) => dataSource[name]
                    .findIndex(d => d.id === a) - dataSource[name]
                    .findIndex(d => d.id === b))[0];
            if (min) {
                const index = dataSource[name].findIndex(d => d.id === min);
                if (ind >= index) {
                    setSelected(dataSource[name].slice(index, ind + 1).map(d => d.id));
                } else {
                    setSelected(dataSource[name].slice(ind, index + 1).map(d => d.id));
                }
            } else {
                setSelected([id]);
            }
        } else {
            setSelected([id]);
        }
    };
    const _setSort = (s, c) => {
      setSort(s);
      setCurrentSort(c);
    };
    return <div className={`${currentPrefix}-quick-edit`}>
      <table>
        <thead>
          <th>{}</th>
          <th>
            <span onClick={() => _setSort(pre => ({...pre, defKey: pre.defKey === 'desc' ? 'asc' : 'desc'}), 'defKey')} className={`${currentPrefix}-quick-edit-sort`}><Icon type={`fa-sort-${sort.defKey}`}/></span>
            {FormatMessage.string({id: 'tableBase.defKey'})}
          </th>
          <th>
            <span onClick={() => _setSort(pre => ({...pre, defName: pre.defName === 'desc' ? 'asc' : 'desc'}), 'defName')} className={`${currentPrefix}-quick-edit-sort`}><Icon type={`fa-sort-${sort.defName}`}/></span>
            {FormatMessage.string({id: 'tableBase.defName'})}
          </th>
          <th>{FormatMessage.string({id: 'tableBase.comment'})}</th>
          <th>{FormatMessage.string({id: 'tableBase.group'})}</th>
        </thead>
        <tbody>
          {
                (dataSourceRef.current[name] || dataSource[name] || [])
                    .sort((a, b) => {
                        const defKeySort = sort[currentSort] === 'desc' ? a?.[currentSort]?.split('')[0]?.localeCompare(b?.[currentSort]?.split('')[0]) : b?.[currentSort]?.split('')[0]?.localeCompare(a?.[currentSort]?.split('')[0]);
                        if (defKeySort === 0) {
                            const otherName = currentSort === 'defKey' ? 'defName' : 'defKey';
                            return sort[otherName] === 'desc' ? a?.[otherName]?.split('')[0]?.localeCompare(b?.[otherName]?.split('')[0]) : b?.[otherName]?.split('')[0]?.localeCompare(a?.[otherName]?.split('')[0]);
                        }
                        return defKeySort;
                    })
                    .map((d, i) => {
                    const group = getGroup(d.id);
                    return <tr key={d.id} className={`${currentPrefix}-quick-edit-item ${selected.includes(d.id) ? `${currentPrefix}-table-selected` : ''}`}>
                      <td onClick={e => onNoClick(e, d.id, i)}>{i + 1}</td>
                      <td>
                        <Input placeholder={FormatMessage.string({id: 'tableBase.defKey'})} defaultValue={d.defKey} onChange={e => _dataChange(e.target.value, 'defKey', d.id)}/>
                      </td>
                      <td>
                        <Input defaultValue={d.defName} onChange={e => _dataChange(e.target.value, 'defName', d.id)}/>
                      </td>
                      <td>
                        <Input defaultValue={d[name === 'dicts' ? 'intro' : 'comment']} onChange={e => _dataChange(e.target.value, name === 'dicts' ? 'intro' : 'comment', d.id)}/>
                      </td>
                      <td>
                        <SelectGroup
                          key={group.join(separator)}
                          hiddenLabel
                          dataSource={dataSource}
                          dataChange={(...args) => _dataChange(...args, d.id)}
                          data={group}
                        />
                      </td>
                    </tr>;
                })
            }
        </tbody>
      </table>
    </div>;
});
