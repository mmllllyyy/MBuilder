import React from 'react';
import { Graph } from '@antv/x6';

import { Icon } from 'components';

import './style/index.less';

const MindTopic = ({node}) => {
    const isExpand = node.prop('isExpand');
    const onClick = () => {
        const expand = node.prop('expand');
        expand?.(node);
    };
    return <div className='mind-topic'>
      {node.getProp('label')}
      {
            node.shape === 'mind-topic-branch' && node.children?.length > 0 && <div onClick={onClick} className='mind-topic-expand' style={{top: (node.size().height - 21) / 2}}>
              { isExpand ? <Icon type='fa-minus-circle'/> : <Icon type='fa-plus-circle'/>}
            </div>
        }
    </div>;
};
