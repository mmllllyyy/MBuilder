import React, { forwardRef, useImperativeHandle, useState } from 'react';
import {Icon, Slider, Tooltip} from 'components';
import numeral from 'numeral';
import {getPrefix} from '../../lib/prefixUtil';

export default React.memo(forwardRef(({prefix, redo, undo, setSelection,
                                          sliderChange, setMinimap}, ref) => {
    const [historyStatus, setHistoryStatus] = useState([true, true]);
    const [enableSelection, setEnableSelection] = useState(true);
    const [scaleNumber, setScaleNumber] = useState(1);
    const [mapOpen, setMapOpen] = useState(false);
    const _setEnableSelection = (v) => {
        setEnableSelection(v);
        setSelection(v);
    };
    const _setMapOpen = () => {
        setMapOpen(!mapOpen);
        setMinimap();
    };
    useImperativeHandle(ref,() => {
        return {
            historyChange: ({undoStack, redoStack}) => {
                setHistoryStatus([undoStack.length === 0, redoStack.length === 0]);
            },
            scaleChange: (scale) => {
                setScaleNumber(scale);
            },
            setMinimap: () => {
                setMapOpen(pre => !pre);
            },
        };
    }, []);
    const currentPrefix = getPrefix(prefix);
    return <div className={`${currentPrefix}-relation-toolbar`}>
      <div className={`${currentPrefix}-relation-toolbar-item`}>
        <Icon onClick={undo} type='icon-bianzu4' disable={historyStatus[0]}/>
        <div className={`${currentPrefix}-relation-toolbar-line`}/>
        <Icon onClick={redo} type='icon-bianzu3' disable={historyStatus[1]}/>
      </div>
      <div className={`${currentPrefix}-relation-toolbar-item`}>
        <Icon
          onClick={() => _setEnableSelection(!enableSelection)}
          type={enableSelection ? 'fa-hand-pointer-o' : 'fa-hand-rock-o'}/>
        <div className={`${currentPrefix}-relation-toolbar-line`}/>
        <span className={`${currentPrefix}-relation-toolbar-size`}>
          <Tooltip
            title={<div className={`${currentPrefix}-relation-toolbar-slider`}>
              <Slider onChange={sliderChange} value={numeral(scaleNumber).multiply(50).value()}/>
            </div>}
            force
            placement='top'>
            <span onClick={() => sliderChange('fit')}>{parseInt(numeral(scaleNumber).multiply(100).value(), 10)}%</span>
          </Tooltip>
          <Icon type='fa-caret-down'/>
        </span>
        <Icon
          className={`${currentPrefix}-relation-toolbar-map-${mapOpen ? 'open' : 'default'}`}
          onClick={() => _setMapOpen(!mapOpen)}
          type='fa-map-o'/>
      </div>
    </div>;
}));
