import React from 'react';
import {SketchPicker} from 'react-color';
import FormatMessage from '../formatmessage';
import {getPrefix} from '../../lib/prefixUtil';

import './style/index.less';

export default React.memo(({prefix, color, onChange, recentColors, restColor}) => {
    const currentPrefix = getPrefix(prefix);
    return <div className={`${currentPrefix}-color-picker`}>
      <SketchPicker
        disableAlpha
        presetColors={['#FFFFFF', '#BFBFBF', '#C00000', '#FFC000', '#F6941D', '#7030A0', '#136534', '#0070C0',
                '#0D0D0D','#6698CC', '#FA5A5A', '#FFD966', '#F8CBAD', '#CB99C5', '#9ACC98', '#093299']}
        color={color}
        onChange={onChange}
        />
      <div className={`${currentPrefix}-color-picker-footer`}>
        <div><FormatMessage id='components.colorPicker.recent'/></div>
        <div>
          {
                recentColors.map((r) => {
                    return <div onClick={() => onChange({hex: r})} key={r} title={r} style={{background: r}} className={`${currentPrefix}-color-picker-footer-item`}>{}</div>;
                })
            }
        </div>
        <div><a onClick={() => onChange({hex: restColor})}><FormatMessage id='components.colorPicker.reset'/></a></div>
      </div>
    </div>;
});
