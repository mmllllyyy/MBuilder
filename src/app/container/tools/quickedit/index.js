import React, {useEffect, useRef, useState} from 'react';
import {FormatMessage, Input, Icon} from 'components';

import {getPrefix} from '../../../../lib/prefixUtil';
import SelectGroup from '../../group/SelectGroup';
import {separator} from '../../../../../profile';
import './style/index.less';

export default React.memo(({ prefix, dataSource, dataChange, name }) => {
    const [selected, setSelected] = useState([]);
    const [,setSortKey] = useState('');
    const [currentSort, setCurrentSort] = useState('');
    const [sort, setSort] = useState({defKey: '', defName: ''});
    const [viewGroups, setViewGroups] = useState(dataSource?.viewGroups || []);
    const initRef = useRef(false);
    const sortData = (data) => {
        if (currentSort && (sort.defKey || sort.defName)) {
            return [...data].sort((a, b) => {
                const firstSort = sort[currentSort] === 'desc' ? a?.[currentSort]?.localeCompare(b?.[currentSort]) : b?.[currentSort]?.localeCompare(a?.[currentSort]);
                if (firstSort === 0) {
                    const otherName = currentSort === 'defKey' ? 'defName' : 'defKey';
                    return sort[otherName] === 'desc' ? a?.[otherName]?.localeCompare(b?.[otherName]) : b?.[otherName]?.localeCompare(a?.[otherName]);
                }
                return firstSort;
            });
        }
        return dataSource[name].map((d) => {
            return data.filter(c => c.id === d.id)[0];
        });
    };
    const dataSourceRef = useRef({...dataSource, [name]: sortData(dataSource[name])});
    const originRef = useRef(dataSourceRef.current[name]);
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
            const min = [...selected]
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
    useEffect(() => {
        if (initRef.current) {
            originRef.current = dataSourceRef.current[name];
            dataSourceRef.current = {
                ...dataSourceRef.current,
                [name]: sortData(dataSourceRef.current[name] || []),
            };
            dataChange && dataChange(dataSourceRef.current);
            setSortKey(Math.uuid());
        } else {
            initRef.current = true;
        }
    }, [currentSort, sort]);
    return <div className={`${currentPrefix}-quick-edit`}>
      <table>
        <thead>
          <tr><th>{}</th>
            <th>
              {FormatMessage.string({id: 'tableBase.defKey'})}
              <span
                className={`${currentPrefix}-quick-edit-sort`}
              >
                <Icon
                  className={sort.defKey === 'asc' ? `${currentPrefix}-quick-edit-sort-picker` : ''}
                  type="fa-sort-asc"
                  onClick={() => _setSort(pre => ({...pre, defKey: pre.defKey === 'asc' ? '' : 'asc'}), 'defKey')}
                />
                <Icon
                  className={sort.defKey === 'desc' ? `${currentPrefix}-quick-edit-sort-picker` : ''}
                  type="fa-sort-desc"
                  onClick={() => _setSort(pre => ({...pre, defKey: pre.defKey === 'desc' ? '' : 'desc'}), 'defKey')}
                />
              </span>
            </th>
            <th>
              {FormatMessage.string({id: 'tableBase.defName'})}
              <span
                className={`${currentPrefix}-quick-edit-sort`}
              >
                <Icon
                  className={sort.defName === 'asc' ? `${currentPrefix}-quick-edit-sort-picker` : ''}
                  type="fa-sort-asc"
                  onClick={() => _setSort(pre => ({...pre, defName: pre.defName === 'asc' ? '' : 'asc'}), 'defName')}
                  />
                <Icon
                  className={sort.defName === 'desc' ? `${currentPrefix}-quick-edit-sort-picker` : ''}
                  type="fa-sort-desc"
                  onClick={() => _setSort(pre => ({...pre, defName: pre.defName === 'desc' ? '' : 'desc'}), 'defName')}
                />
              </span>
            </th>
            <th>{FormatMessage.string({id: 'tableBase.comment'})}</th>
            <th>{FormatMessage.string({id: 'tableBase.group'})}</th></tr>
        </thead>
        <tbody>
          {
                dataSourceRef.current[name]
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
