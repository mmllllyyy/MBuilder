import React, { forwardRef, useRef, useEffect } from 'react';
import { Graph, Markup } from '@antv/x6';
import {Icon, Tooltip} from 'components';
import marked from 'marked';
import FormatMessage from '../../../formatmessage';
import '@antv/x6-react-shape';
import './style/index.less';
import { renderer } from '../util';
// eslint-disable-next-line import/named
import { platform } from '../../../../lib/middle';
import info from './style/info.png';

const EditNode = forwardRef(({node}, ref) => {
  const preRef = useRef(null);
  const label = node.getProp('label');
  const note = node.getProp('note');
  const linkData = JSON.parse(node.getProp('link') || '{}');
  const inputRef = useRef(null);
  const editable = node.getProp('editable');
  const onChange = () => {
    node.setProp('label', inputRef.current.value);
  };
  const nodeClickText = () => {
    const store = node.store;
    store?.data?.nodeClickText(node);
  };
  useEffect(() => {
    if (editable) {
      if (window.getComputedStyle(inputRef.current).pointerEvents !== 'none') {
        inputRef.current.focus();
      }
    } else if (platform === 'json') {
      const links = preRef.current.querySelectorAll('a[href]');
      links.forEach((link) => {
        link.addEventListener('click', (e) => {
          const url = link.getAttribute('href');
          e.preventDefault();
          // eslint-disable-next-line global-require,import/no-extraneous-dependencies
          require('electron').shell.openExternal(url);
        });
      });
    }
  }, [editable]);
  const getLabel = () => {
    marked.use({ renderer });
    return marked(label);
  };
  return <div
    ref={ref}
    className={`chiner-er-editnode ${node.shape === 'edit-node-circle' ? 'chiner-er-editnode-circle' : ''}`}
    style={{
      background: node.getProp('fillColor'),
      color: node.getProp('fontColor'),
      zIndex: 10,
      alignItems: node.shape === 'group' ? 'start' : 'center',
    }}
  >
    {
      // eslint-disable-next-line no-nested-ternary
      editable ? <textarea
        onChange={onChange}
        placeholder={FormatMessage.string({id: 'canvas.node.remarkPlaceholder'})}
        ref={inputRef}
        defaultValue={label}
      /> :
      <>{(linkData.type ? <a style={{textDecoration: 'underline'}} onClick={nodeClickText}><pre
        ref={preRef}
              // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{__html: getLabel()}}
          /></a> : <pre
            ref={preRef}
              // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{__html: getLabel()}}
          />)}
        {note && <Tooltip
          placement='top'
          title={note}
          force>
          <Icon
            className='chiner-er-editnode-info'
            type='fa-info-circle'
          />
        </Tooltip>}
      </>
    }
  </div>;
});

// 矩形框
Graph.registerNode('edit-node', {
  inherit: 'react-shape',
  zIndex: 2,
  attrs: {
    body: {
      stroke: '#DFE3EB',  // 边框颜色
      strokeWidth: 1,
    },
  },
  portMarkup: [Markup.getForeignObjectMarkup()],
  component: <EditNode/>,
});

// 圆角矩形框
Graph.registerNode('edit-node-circle', {
  inherit: 'react-shape',
  zIndex: 2,
  attrs: {
    body: {
      stroke: '#DFE3EB',  // 边框颜色
      strokeWidth: 1,
      rx: 10,
      ry: 10,
    },
  },
  portMarkup: [Markup.getForeignObjectMarkup()],
  component: <EditNode/>,
});

// 菱形框
Graph.registerNode('edit-node-polygon', {
  inherit: 'polygon',
  zIndex: 2,
  markup: [
    {
      tagName: 'polygon',
      selector: 'body',
    },
    {
      tagName: 'image',
      selector: 'image',
    },
    {
      tagName: 'text',
      selector: 'text',
    },
  ],
  propHooks(metadata) {
    const { note, size } = metadata;
    if (note) {
      return {
        ...metadata,
        attrs: {
          ...metadata?.attrs,
          image: {
            x: size.width / 2 - 5,
            y: size.height - 20,
            style: {
              display: '',
              cursor: 'default',
            },
          },
        },
      };
    }
    return metadata;
  },
  attrs: {
    body: {
      stroke: '#DFE3EB',  // 边框颜色
      strokeWidth: 1,
      refPoints: '0,10 10,0 20,10 10,20',
    },
    image: {
      'xlink:href': info,
      width: 10,
      height: 10,
      style: {
        display: 'none',
        cursor: 'default',
      },
    },
    text: {
      event: 'node:click:text',
      style: {
        fontSize: '12px',
        fill: 'rgba(0, 0, 0, 0.65)',
      },
    },
  },
  portMarkup: [Markup.getForeignObjectMarkup()],
});

// 圆形框
Graph.registerNode('edit-node-circle-svg', {
  inherit: 'circle',
  zIndex: 2,
  markup: [
    {
      tagName: 'circle',
      selector: 'body',
    },
    {
      tagName: 'image',
      selector: 'image',
    },
    {
      tagName: 'text',
      selector: 'text',
    },
  ],
  propHooks(metadata) {
    const { note, size } = metadata;
    if (note) {
      return {
        ...metadata,
        attrs: {
          ...metadata?.attrs,
          image: {
            x: size.width / 2 - 5,
            y: size.height - 20,
            style: {
              display: '',
              cursor: 'default',
            },
          },
        },
      };
    }
    return metadata;
  },
  attrs: {
    body: {
      stroke: '#DFE3EB',  // 边框颜色
      strokeWidth: 1,
    },
    image: {
      'xlink:href': info,
      width: 10,
      height: 10,
      style: {
        display: 'none',
        cursor: 'default',
      },
    },
    text: {
      event: 'node:click:text',
      style: {
        fontSize: '12px',
        fill: 'rgba(0, 0, 0, 0.65)',
      },
    },
  },
  portMarkup: [Markup.getForeignObjectMarkup()],
});

// 分组框
Graph.registerNode('group', {
  inherit: 'react-shape',
  zIndex: 1,
  attrs: {
    body: {
      strokeDasharray: '5 5',
      strokeWidth: 1,
      stroke: '#000000',
    },
  },
  component: <EditNode/>,
});
