import React, { forwardRef } from 'react';
import { Graph } from '@antv/x6';
import '@antv/x6-react-shape';
import {calcColor} from '../util';
import { separator } from '../../../../../profile';
import { getTitle } from '../../../../lib/datasource_util';

const Table = forwardRef(({node}, ref) => {
  const data = node.data;
  const store = node.store;
  const id = node.id;
  const size = node.size();
  const allFk = node?._model?.getIncomingEdges(id)?.map(t => t.getTargetPortId()
      ?.split(separator)[0]) || [];
  const calcFKPKShow = (f, h) => {
    if (h.refKey === 'primaryKey') {
      if (f[h.refKey]) {
        return '<PK>';
      } else if (allFk.includes(f.id)) {
        return '<FK>';
      }
    }
    return f[h.refKey];
  };
  const sliceCount = Math.floor((size.height - 31) / 23);
  return <div
    ref={ref}
    style={{
      background: '#FFFFFF',
      color: node.getProp('fontColor'),
      borderRadius: '5px',
      height: '100%',
      boxSizing: 'border-box',
    }}
  >
    <div
      style={{
        background: node.getProp('fillColor') || '#DDE5FF',
        WebkitTextFillColor: node.getProp('fontColor') || 'rgba(0,0,0,.65)',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '12px',
        borderRadius: '5px 5px 0 0',
        padding: '4px 0',
        borderBottom: '1px solid #DFE3EB',
        height: '27px',
        boxSizing: 'border-box',
        overflowY: 'hidden',
      }}
    >
      {`${getTitle(data)}${store?.data.count > 0 ? `:${store?.data.count}` : ''}`}
    </div>
    <div style={{ height: 'calc(100% - 27px)', background:  calcColor(node.getProp('fillColor') || '#DDE5FF'), boxSizing: 'border-box'}}>
      {
          data.fields.slice(0, sliceCount).map((f) => {
          return <div
            key={`${f.id}${f.defName}`}
            style={{
                whiteSpace: 'nowrap',
                height: '23px',
                padding: '2px 4px',
                boxSizing: 'border-box',
                fontSize: '12px',
            }}
            >
            {
                [{refKey: 'primaryKey'}].concat(data.headers
                    .filter(h => h.refKey !== 'primaryKey')).map((h) => {
                return <span
                  style={{
                    boxSizing: 'border-box',
                    width: data.maxWidth[h.refKey],
                    fontSize: '12px',
                    display: 'inline-block',
                    marginLeft: '8px',
                    WebkitTextFillColor: node.getProp('fontColor') || 'rgba(0,0,0,.65)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    textDecoration: f.primaryKey ? 'underline' : 'none',
                  }}
                  key={h.refKey}
                >
                  {calcFKPKShow(f, h)}
                </span>;
              })
            }
          </div>;
        })
      }
      {data.fields.length > sliceCount && <div
        style={{
            boxSizing: 'border-box',
            whiteSpace: 'nowrap',
            height: '23px',
            padding: '2px 4px 2px 4px',
            textAlign: 'center',
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            cursor: 'pointer',
      }}
        >...</div>}
    </div>
  </div>;
});

Graph.registerNode('table-img', {
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

