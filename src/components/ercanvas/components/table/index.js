import React, { forwardRef } from 'react';
import { Graph } from '@antv/x6';
import '@antv/x6-react-shape';
import { separator } from '../../../../../profile';
import Tooltip from '../../../tooltip';
import { getTitle } from '../../../../lib/datasource_util';
import './style/index.less';
import {calcColor} from '../util';

const Table = forwardRef(({node}, ref) => {
  const data = node.data;
  const store = node.store;
  const id = node.id;
  const size = node.size();
  const linkData = JSON.parse(node.getProp('link') || '{}');
  const allFk = node?._model?.getIncomingEdges(id)?.map(t => t.getTargetPortId()
      ?.split(separator)[0]) || [];
  const onDragOver = (e) => {
    e.preventDefault();
  };
  const onDrop = (e) => {
    store?.data?.updateFields(store.data.originKey, JSON.parse(e.dataTransfer.getData('fields')));
  };
  const nodeClickText = () => {
    store?.data?.nodeClickText(node);
  };
  const validateSelected = (f, {targetPort, sourcePort}) => {
    const fieldTargetPort = `${f.id}${separator}in`;
    const fieldSourcePort = `${f.id}${separator}out`;
    return targetPort === fieldTargetPort
        || targetPort === fieldSourcePort
        || sourcePort === fieldTargetPort
        || sourcePort === fieldSourcePort;
  };
  const calcFKPKShow = (f, h) => {
   // console.log(f, h);
    if (h.refKey === 'primaryKey') {
      if (f[h.refKey]) {
        return '<PK>';
      } else if (allFk.includes(f.id)) {
        return '<FK>';
      }
    } else if (h.refKey === 'notNull') {
      if (f[h.refKey]) {
        return '<NOTNULL>';
      }
      return '';
    }
    return f[h.refKey];
  };
  const sliceCount = Math.floor((size.height - 31) / 23);
  const renderBody = (bodyData, calcWidth) => {
    return bodyData.map((f) => {
      return <div
        key={`${f.id}${f.defName}`}
        className={`${validateSelected(f, store.data) ? 'chiner-er-table-body-selected' : ''} ${f.primaryKey ? 'chiner-er-table-body-primary' : ''}`}>
        {
          [{refKey: 'primaryKey'}].concat(data.headers
              .filter(h => h.refKey !== 'primaryKey')).map((h) => {
            const label = calcFKPKShow(f, h);
            return <Tooltip
              key={h.refKey}
              title={typeof label === 'string' ?
                  label.replace(/\r|\n|\r\n/g, '')
                  : label}><span
                    style={{
                  width: calcWidth(h.refKey),
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                    key={h.refKey}
            >
                    {typeof label === 'string' ?
                      label.replace(/\r|\n|\r\n/g, '')
                      : label}
                  </span></Tooltip>;
          })
        }
      </div>;
    });
  };
  return <div
    ref={ref}
    className='chiner-er-table'
    onDragOver={onDragOver}
    onDrop={onDrop}
    style={{color: node.getProp('fontColor')}}
  >
    <div
      className='chiner-er-table-header'
      style={{background: node.getProp('fillColor')}}
    >
      {
        linkData.type ? <a style={{textDecoration: 'underline'}} onClick={nodeClickText}>{getTitle(data)}{store?.data.count > 0 ? `:${store?.data.count}` : ''}</a>
            : `${getTitle(data)}${store?.data.count > 0 ? `:${store?.data.count}` : ''}`
      }
      {
        data?.comment &&
          <Tooltip title={data?.comment} force conversion={1} placement='top'>
            <div className='chiner-er-table-header-icon'>
              <div style={{borderRightColor: node.getProp('fillColor')}}>{}</div>
            </div>
          </Tooltip>
      }
    </div>
    <div
      className='chiner-er-table-body'
      style={{background: calcColor(node.getProp('fillColor') || '#DDE5FF')}}
    >
      {
        renderBody(data.fields.slice(0, sliceCount), (key) => {
          return data.maxWidth[key];
        })
      }
      {data.fields.length > sliceCount && <Tooltip
        force
        offsetTop={5}
        title={<div
          className='chiner-er-table-body'
          style={{
            fontSize: '12px',
            overflow: 'auto',
        }}
        >
          {renderBody(data.fields.slice(sliceCount), (key) => {
            return data.originWidth[key];
          })}
        </div>}
      >
        <div
          style={{textAlign: 'center', position: 'fixed', bottom: 0, left: 0, width: '100%', cursor: 'pointer'}}
        >...</div>
      </Tooltip>}
    </div>
  </div>;
});

Graph.registerNode('table', {
  inherit: 'react-shape',
  zIndex: 2,
  attrs: {
    body: {
      stroke: '#DFE3EB',  // 边框颜色
      strokeWidth: 2,
      rx: 5,
      ry: 5,
    },
  },
  component: <Table/>,
});


/*Graph.registerNode('table', {
  zIndex: 2,
  //inherit: 'rect',
  propHooks(metadata){
    const { data, count, fillColor, fontColor, headerWidth, size, ...rest } = metadata;
    if (data) {
      const column = [];
      console.log(size.width, data.headers
          .reduce((a, b) => a + data.maxWidth[b.refKey], (data.headers.length - 1) * 5));
      const calcFKPKShow = (f, h) => {
        /!*if (h.refKey === 'primaryKey') {
          if (f[h.refKey]) {
            return '<PK>';
          }
          return '<FK>';
        }*!/
        return f[h.refKey] || '';
      };
      const attrs = {
        header: {
          text: `${data.defKey}${count > 0 ? `:${count}` : ''}(${data.defName})`,
          x: (size.width / 2) - (data.headerWidth / 2),
          y: 20,
          fill: fontColor || 'rgba(0,0,0,0.85)',
          fontSize: 12,
        },
      };
      const calcX = (hI, x) => {
        if (hI === 0) {
          return x;
        }
        const preHeaders = (data.headers || []).slice(0, hI);
        return preHeaders.reduce((a, b) => {
          return a + data.maxWidth[b.refKey];
        }, x + 10 * preHeaders.length);
      };
      const calcAttrs = (f, i, h, hI, x, y) => {
        const name = `${i}-${hI}`;
        attrs[name] = {
          text: calcFKPKShow(f, h),
          x: calcX(hI, x),
          y: y + 13,
          fill: fontColor || 'rgba(0,0,0,0.85)',
          fontSize: 12,
        };
        return name;
      };
      const markup = [
        {
          tagName: 'rect',
          attrs: {
            stroke: '#DFE3EB',  // 边框颜色
            strokeWidth: 2,
            fill: fillColor || '#ACDAFC',
            x: 0,
            y: 0,
            width: size.width,
            height: size.height,
          },
        },
        {
          tagName: 'text',
          selector: 'header',
        },
        {
          tagName: 'line',
          attrs: {
            x1: 8,
            x2: size.width - 8,
            y1: 24,
            y2: 24,
            stroke: fontColor || 'rgba(0,0,0,0.85)',
            'stroke-width': 1,
          },
        },
      ].concat((data.fields || []).map((f, i) => {
        const x = 8;
        const y = 26 + 18 * i + 5 * (i + 1);
        column.push(...(data.headers || []).map((h, hI) => {
          return {
            tagName: 'text',
            selector: calcAttrs(f, i, h, hI, x, y),
          };
        }));
        return {
          tagName: 'rect',
          attrs: {
            x,
            y,
            width: size.width - 16,
            height: 18,
            fill: fillColor || '#ACDAFC',
          },
        };
      })).concat(column);
      return {
        ...rest,
        attrs,
        markup,
        size,
      };
    }
    return rest;
  },
  //component: <Table/>,
});*/
