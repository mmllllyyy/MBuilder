import React, {useState, useRef} from 'react';
import {FormatMessage, IconTitle, Icon, Checkbox, Input} from 'components';
import { moveArrayPosition } from '../../../lib/array_util';
import {getPrefix} from '../../../lib/prefixUtil';
import {getFullColumns, attNames, getAttNamesValue} from '../../../lib/datasource_util';


export default React.memo(({prefix, dataSource, columnsChange, className}) => {
    const useEnable = ['isStandard', 'uiHint', 'extProps'];
    const [data, updateData] = useState(() => {
        const full = getFullColumns();
        const currentData = (dataSource?.profile?.headers || []).map(h => {
            if (attNames.includes(h.refKey)) {
                return h;
            }
            return {
                ...h,
                value: full.filter(f => f.newCode === h.refKey)[0]?.value || h.refKey
            }
        })
        return currentData.concat(attNames
            .filter(a => currentData.findIndex(c => c.refKey === a) < 0)
            .map(a => ({
                refKey: a,
                value: getAttNamesValue(a),
                hideInGraph: true,
                enable: false
            })))
    });
    const [selected, updateSelected] = useState('');
    const dataRef = useRef(data);
    dataRef.current = data;
    const selectedRef = useRef(selected);
    selectedRef.current = selected;
    const rowSelected = (p) => {
        if (selected === p) {
            updateSelected('');
        } else {
            updateSelected(p);
        }
    };
    const propsChange = (newData) => {
        columnsChange && columnsChange(newData);
    };
    const optProperty = (type) => {
        const optIndex = data.findIndex(d => d.refKey === selected);
        if (type === 'up' || type === 'down') {
            const tempData = moveArrayPosition(data, optIndex, type === 'up' ? optIndex - 1 : optIndex + 1);
            updateData(tempData);
            propsChange(tempData);
        }
    };
    const onValueChange = (e, p) => {
        const value = e.target.value;
        updateData((pre) => {
            const temp = pre.map(d => {
                if (d.refKey === p.refKey) {
                    return {
                        ...d,
                        value,
                    }
                }
                return d;
            })
            propsChange(temp);
            return temp;
        });
    }
    const currentPrefix = getPrefix(prefix);
    const onClick = (p) => {
        updateData((pre) => {
            const temp = pre.map(d => {
                if (d.refKey === p.refKey) {
                    return {
                        ...d,
                        hideInGraph: !d.hideInGraph,
                    }
                }
                return d;
            })
            propsChange(temp);
            return temp;
        });
    }
    const onEnableChange = (e, p) => {
        const value = e.target.checked;
        updateData((pre) => {
            const temp = pre.map(d => {
                if (d.refKey === p.refKey) {
                    return {
                        ...d,
                        enable: value,
                    }
                }
                return d;
            })
            propsChange(temp);
            return temp;
        });
    }
    return <div className={`${currentPrefix}-entity-base-properties ${className}`}>
        <div className={`${currentPrefix}-entity-base-properties-list-opt`}>
           <IconTitle disable={!selected} title={FormatMessage.string({id: 'tableEdit.moveUp'})} onClick={() => optProperty('up')} type='fa-arrow-up'/>
            <IconTitle disable={!selected} title={FormatMessage.string({id: 'tableEdit.moveDown'})} onClick={() => optProperty('down')} type='fa-arrow-down'/>
        </div>
        <div className={`${currentPrefix}-entity-base-properties-list-container`}>
            <table>
                <thead>
                   <tr>
                       <th/>
                       <th style={{zIndex: 2, textAlign: 'center'}}><FormatMessage id='config.enable'/></th>
                       <th style={{textAlign: 'center'}}><FormatMessage id='config.columnKey'/></th>
                       <th><FormatMessage id='config.columnName'/></th>
                       <th><FormatMessage id='config.hideInGraph'/></th>
                   </tr>
                </thead>
                <tbody>
                {data.map((p, index) => {
                    return (
                        <tr key={p.refKey}
                            onClick={() => rowSelected(p.refKey)}
                            className={`${selected === p.refKey ? `${currentPrefix}-entity-base-properties-list-selected` : ''}`}
                        >
                                <td style={{width: '30px'}}>{index + 1}</td>
                                <td className={`${currentPrefix}-setting-entity-init-fields-check`}>
                                    <Checkbox
                                        disable={!attNames.concat(useEnable).includes(p.refKey)}
                                        style={{width: '100%'}}
                                        defaultChecked={p.enable !== false}
                                        onChange={e => onEnableChange(e, p)}
                                    >
                                    </Checkbox>
                                </td>
                                <td className={`${currentPrefix}-setting-entity-init-fields-column`}>{p.refKey}</td>
                                <td>{attNames.includes(p.refKey) ? <Input onChange={e => onValueChange(e, p)} defaultValue={p.value}/> : p.value}</td>
                                <td><Icon onClick={() => onClick(p)} style={{cursor: 'pointer'}} type={`fa-eye${p.hideInGraph ? '-slash' : ''}`}/>{p.hideInGraph}</td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    </div>;
});
