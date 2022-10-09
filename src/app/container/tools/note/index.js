import React, {useEffect, useState, useRef} from 'react';
import {SketchPicker} from 'react-color';
import {Button, FormatMessage, Modal, Text} from 'components';

import './style/index.less';
import {getPrefix} from '../../../../lib/prefixUtil';

export default React.memo(({data, prefix, dataChange}) => {
    const isInit = useRef(false);
    const [current, setCurrent] = useState('');
    const [value, setValue] = useState('');
    const [notes, setNotes] = useState(() => {
        if ([...new Set(data.map(d => (d.notes?.tags || []).join('')))].length === 1) {
            return data[0].notes?.tags || [];
        }
        return [];
    });
    const [color, setColor] = useState(() => {
        if ([...new Set(data.map(d => (d.notes?.fontColor || [])))].length === 1) {
            return data[0].notes?.fontColor || '';
        }
        return '';
    });
    const currentPrefix = getPrefix(prefix);
    useEffect(() => {
        if (isInit.current === true) {
            dataChange && dataChange({
                fontColor: color,
                tags: notes,
            });
        } else {
            isInit.current = true;
        }
    }, [color, notes]);
    const onOk = () => {
        setNotes((pre) => {
            if (current) {
                return pre.map((p) => {
                    if (p.id === current) {
                        return {
                            ...p,
                            content: value,
                        };
                    }
                    return p;
                });
            }
            return pre.concat({content: value, id: Math.uuid()});
        });
        setValue('');
        setCurrent('');
    };
    const onEdit = (n) => {
        setCurrent(n.id);
        setValue(n.content);
    };
    const onRemove = (n) => {
        Modal.confirm({
            title: FormatMessage.string({id: 'deleteConfirmTitle'}),
            message: FormatMessage.string({id: 'deleteConfirm'}),
            onOk:() => {
                if (current === n.id) {
                    setCurrent('');
                }
                setNotes((pre) => {
                    return pre.filter(p => p.id !== n.id);
                });
            },
        });
    };
    return <div className={`${currentPrefix}-note`}>
      <div className={`${currentPrefix}-note-left`}>
        <div><span><FormatMessage id='note.note'/></span></div>
        <div>
          <Text
            resize='none'
            placeholder={FormatMessage.string({id: 'note.placeholder'})}
            onChange={e => setValue(e.target.value)}
            value={value}
          />
          <Button disable={!value} type='primary' onClick={onOk}>
            {
                    current ? <FormatMessage id='note.save'/> : <FormatMessage id='note.add'/>
            }
          </Button>
        </div>
        <div>
          {
                notes.map((n, i) => {
                    return <div key={n.id}>
                      <span>{`${i + 1}.${n.content}`}</span>
                      <span>
                        <a onClick={() => onEdit(n)}> <FormatMessage id='note.edit'/></a>
                        <a>{}</a>
                        <a onClick={() => onRemove(n)}> <FormatMessage id='note.remove'/></a>
                      </span>
                    </div>;
                })
            }
        </div>
      </div>
      <div className={`${currentPrefix}-note-right`}>
        <div><span><FormatMessage id='note.noteColor'/></span></div>
        <div>
          <SketchPicker
            disableAlpha
            presetColors={['#FFFFFF', '#BFBFBF', '#C00000', '#FFC000', '#F6941D', '#7030A0', '#136534', '#0070C0',
                  '#0D0D0D','#6698CC', '#FA5A5A', '#FFD966', '#F8CBAD', '#CB99C5', '#9ACC98', '#093299']}
            color={color}
            onChange={c => setColor(c.hex)}
          />
        </div>
        <div>
          <span style={{color}}><FormatMessage id='note.noteFontColor'/></span>
          <a style={{marginLeft: 5}} onClick={() => setColor('')}><FormatMessage id='note.clear'/></a>
        </div>
      </div>
    </div>;
});
