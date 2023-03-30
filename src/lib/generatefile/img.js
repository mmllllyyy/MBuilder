import {Graph} from '@antv/x6';
import _ from 'lodash/object';

import { calcCellData } from '../datasource_util';
import html2canvas from 'html2canvas';
import { saveTempImages } from '../middle';
import clipCanvasEmptyPadding from 'components/ercanvas/_util/clip_canvas';

export const img = (data, relationType, dataSource, needCalc = true, groups) => {
  return new Promise((res) => {
    const dom = document.createElement('div');
    dom.style.width = `${300}px`;
    dom.style.height = `${600}px`;
    document.body.appendChild(dom);
    const graph = new Graph({
      container: dom,
      async: true,
      autoResize: false,
      grid: false,
      scroller: {
        enabled: true,
      },
      connecting: {
        connectionPoint: 'anchor',
      },
    });
    const updateStyle = () => {
      dom.querySelectorAll('body').forEach(d => {
        d.style.margin  = '0';
      });
    }
    const mindCells = (data || []).filter(c => c.shape === 'mind-topic-branch' || c.shape=== 'mind-topic' || c.shape === 'mind-edge');
    const cells = ((needCalc ? calcCellData(data, dataSource, null, groups, null, relationType, null, null) : data))
        .concat(mindCells).map((d) => {
      const other = {
        tools: {},
      };
      if (d.shape === 'erdRelation') {
        const relation = d.relation?.split(':') || [];
        other.attrs = {
          ...(d.attrs || {}),
          line: {
            ..._.get(d, 'attrs.line'),
            strokeWidth: 1,
            stroke: d.fillColor || '#ACDAFC',
            sourceMarker: {
              ..._.get(d, 'attrs.line.sourceMarker'),
              relation: relation[0],
            },
            targetMarker: {
              ..._.get(d, 'attrs.line.targetMarker'),
              relation: relation[1],
            },
          }
        }
      }
      if (d.shape === 'edit-node-polygon' || d.shape === 'edit-node-circle-svg') {
        return {
          ...d,
          shape: `${d.shape}-img`,
        };
      }
      return {
        ..._.omit(d, ['attrs', 'component']),
        shape: `${d.shape}-img`,
        ...other,
      };
    });
    graph.on('render:done', () => {
      graph.centerContent();
      //setTimeout(() => {
        updateStyle()
        res(dom);
      //});
    });
    graph.fromJSON({cells});
    if (cells.length === 0) {
      res(dom);
    }
  })
};

export const imgAll = (dataSource, callBack, useBase, imageType) => {
  if ((dataSource.diagrams || []).length === 0){
    return new Promise((res, rej) => {
      if (useBase) {
        res([]);
      } else {
        saveTempImages([])
            .then((dir) => {
              res(dir);
            }).catch(err => rej(err));
      }
    });
  }
  return new Promise( async (res, rej) => {
    const result = [];
    for (let i = 0; i < dataSource.diagrams.length; i += 1){
      const d = dataSource.diagrams[i];
      const hiddenPort = {
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            strokeWidth: 1,
            style: {
              visibility: 'hidden',
            },
          },
        },
        position: { name: 'absolute' },
        zIndex: 3,
      };
      await new Promise((resolve, reject) => {
        img(d.canvasData.cells, d.relationType, dataSource, true, {
          in: {
            ...hiddenPort,
          },
          out: {
            ...hiddenPort,
          },
          extend: {
            ...hiddenPort,
          },
        }).then((dom) => {
          if (imageType === 'svg') {
            const baseData = html2svg(d.canvasData.cells, dom);
            result.push({fileName: d.id, data: useBase ? `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(baseData)))}` : baseData});
            console.log(d.defName || d.defKey);
            callBack && callBack();
            resolve();
          } else {
            html2canvas(dom).then((canvas) => {
              document.body.removeChild(dom.parentElement.parentElement);
              const clippedCanvas = clipCanvasEmptyPadding(canvas, 30);
              const baseData = clippedCanvas.toDataURL('image/png');
              const dataBuffer = Buffer.from(baseData.replace(/^data:image\/\w+;base64,/, ""), 'base64');
              result.push({fileName: d.id, data: useBase ? baseData : dataBuffer});
              console.log(d.defName || d.defKey);
              callBack && callBack();
              resolve();
            }).catch(err => reject(err));
          }
        }).catch(err => reject(err))
      })
    }
    if (useBase) {
      res(result);
    } else {
      saveTempImages(result)
          .then((dir) => {
            res(dir);
          }).catch(err => rej(err));
    }
  });
}


export const html2svg = (data, dom) => {
  const cells = data.filter(c => c.position);
  const minX = Math.min(...cells.map(c => c.position.x));
  const minY = Math.min(...cells.map(c => c.position.y));
  const svg = dom.querySelector('.x6-graph-svg');
  const viewport = dom.querySelector('.x6-graph-svg-viewport');
  viewport.setAttribute('transform', `matrix(1,0,0,1,${-minX + 10},${-minY + 10})`);
  const rect = viewport.getBoundingClientRect();
  return `<svg width="${rect.width + 20}px" height="${rect.height + 20}px" viewBox="0 0 ${rect.width + 20} ${rect.height + 20}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
          ${svg.innerHTML.replaceAll('size="1px">', 'size="1px"/>')}</svg>`;
}

