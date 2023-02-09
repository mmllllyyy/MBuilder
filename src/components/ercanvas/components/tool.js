import { Graph, ToolsView } from '@antv/x6';
import ReactDom from 'react-dom';
import React, {useRef, useState} from 'react';
import {Button, FormatMessage, Icon, openModal} from 'components';
import LabelEditor from 'components/ercanvas/LabelEditor';
import { prefix } from '../../../../profile';
import Svg from './svg';

const ToolItem = ToolsView.ToolItem;


// 节点编辑
class EditableCellTool extends ToolItem {
  render() {
    super.render();
    const cell = this.cell;
    let x = 0;
    let y = 0;
    let width = 0;
    let height = 0;

    const position = cell.position();
    const size = cell.size();
    const pos = this.graph.localToGraph(position);
    const zoom = this.graph.zoom();
    width = size.width * zoom;
    height = size.height * zoom;
    x = pos.x;
    y = pos.y;

    const editorParent = ToolsView.createElement('div', false);
    editorParent.setAttribute('class', `${prefix}-er-editnode`);
    editorParent.style.position = 'absolute';
    editorParent.style.left = `${x}px`;
    editorParent.style.top = `${y}px`;
    editorParent.style.width = `${width}px`;
    editorParent.style.height = `${height}px`;

    this.editorContent = ToolsView.createElement('textarea', false);
    editorParent.appendChild(this.editorContent);
    this.container.appendChild(editorParent);

    this.init();

    return this;
  }

  init = () => {
    const cell = this.cell;
    const value = cell.label;
    if (value) {
      this.editorContent.value = value;
      cell.attr('text/style/display', 'none', { ignoreHistory : true});
    }
    setTimeout(() => {
      if (window.getComputedStyle(this.editorContent).pointerEvents !== 'none') {
        this.editorContent.onblur = (e) => {
          this.graph.batchUpdate('updateNodeText', () => {
            cell.setProp('label', e.target.value);
            cell.attr('text/text', e.target.value);
          });
        };
        this.editorContent.focus();
      }
    });
  }
}

EditableCellTool.config({
  tagName: 'div',
  isSVGElement: false,
});

Graph.registerNodeTool('editableCell', EditableCellTool, true);



// 显示节点大小
class ShowSizeTool extends ToolItem {
  render() {
    super.render();
    const cell = this.cell;
    let x = 0;
    let y = 0;

    const position = cell.position();
    const size = cell.size();
    const pos = this.graph.localToGraph(position);
    const zoom = this.graph.zoom();
    x = pos.x;
    y = pos.y;

    const sizeDom = ToolsView.createElement('div', false);
    sizeDom.setAttribute('class', `${prefix}-node-size`);
    sizeDom.style.position = 'absolute';
    sizeDom.style.left = `${x}px`;
    sizeDom.style.top = `${y + 10 + size.height * zoom}px`;
    sizeDom.style.width = `${size.width * zoom}px`;
    sizeDom.innerHTML = `<span>${Math.floor(size.width * zoom)} * ${Math.floor(size.height * zoom)}</span>`;
    this.container.appendChild(sizeDom);
    this.init();
    return this;
  }
}

ShowSizeTool.config({
  tagName: 'div',
  isSVGElement: false,
});

Graph.registerNodeTool('showSizeTool', ShowSizeTool, true);


// 节点或边的工具栏
const EdgeTooltipContent = ({onUpdate, edge}) => {
  const [dataPosition, setDataPosition] = useState({left: 0, bottom: -40});
  const [dataType, setDataType] = useState('');
  const [arrowReverse, setArrowReverse] = useState('left');
  const [arrowState, setArrowState] = useState(() => {
    const attr = edge.attr('line');
    // triangle-stroke
    return [attr?.sourceMarker?.relation || 'none',
      attr?.targetMarker?.relation || 'none'].map(r => (r === 'arrow' ? 'triangle-stroke' : r));
  });
  const [lineState, setLineState] = useState(() => {
    return {
      lineStyle: edge.attr('line/strokeDasharray') === '5 5' ? 'dotted-large' : '#icon-stroke-line1',
      // eslint-disable-next-line no-nested-ternary
      lineType: edge.getProp('router')?.name === 'normal' ?
          'straight' : (edge.getProp('connector')?.name === 'rounded' ? 'fillet' : 'polyline'),
    };
  });
  const [isLock, setIsLock] = useState(() => {
    return edge.getProp('isLock');
  });
  const arrowType = ['none', 'triangle-stroke', 'triangle-fill', 'right', 'concave'];
  const erArrowType = ['1', 'n'];
  const lineType = ['straight', 'polyline', 'fillet'];
  const lineStyle = ['#icon-stroke-line1', 'dotted-large'];
  const isLeave = useRef(true);
  const time = useRef(null);
  const _onUpdate = (type, value) => {
    if(type === 'relation' || type === 'arrow-exchange') {
      setArrowState((pre) => {
        if (type === 'arrow-exchange') {
          return [pre[1], pre[0]];
        } else if (arrowReverse === 'left') {
          return [value, pre[1]];
        }
        return [pre[0], value];
      });
    } else if (type === 'lineType' || type === 'lineStyle') {
      setLineState((pre) => {
        return {
          ...pre,
          [type]: value,
        };
      });
    } else if (type === 'lock') {
      setIsLock(pre => !pre);
    }
    onUpdate(type, value, arrowReverse);
  };
  const checkLeave = () => {
    clearTimeout(time.current);
    time.current = setTimeout(() => {
      if (isLeave.current) {
        setDataType('');
      }
    }, 300);
  };
  const onMouseOver = (e, type, reverse) => {
    isLeave.current = false;
    checkLeave();
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    setDataType(type);
    setArrowReverse(reverse);
    setDataPosition({
      left: rect.x + rect.width / 2 - (type === 'line' ? 50 : 25),
      top: rect.bottom + 8,
    });
  };
  const onMouseLeave = () => {
    isLeave.current = true;
    checkLeave();
  };
  const onMouseOverData = () => {
    isLeave.current = false;
    checkLeave();
  };
  const onMouseLeaveData = () => {
    isLeave.current = true;
    checkLeave();
  };
  const renderDataType = () => {
    if (dataType === 'line') {
      return <div className={`${prefix}-edge-tooltip-content-item-data-line`}>
        <div>
          <div>线条类型</div>
          <div>
            {
              lineType.map((t) => {
                return <Svg
                  className={lineState.lineType === t ? `${prefix}-edge-tooltip-content-item-data-line-selected` : ''}
                  key={t}
                  type={t}
                  isArrow={false}
                  onClick={() => _onUpdate('lineType', t)}/>;
              })
            }
          </div>
        </div>
        <div>
          <div>线条样式</div>
          <div>
            {
              lineStyle.map((s) => {
                return <Svg
                  className={lineState.lineStyle === s ? `${prefix}-edge-tooltip-content-item-data-line-selected` : ''}
                  key={s}
                  type={s}
                  isArrow={false}
                  onClick={() => _onUpdate('lineStyle', s)}/>;
              })
            }
          </div>
        </div>
      </div>;
    }
    return <div className={`${prefix}-edge-tooltip-content-item-data-arrow`}>
      {arrowType.concat(erArrowType).map((a) => {
        return <div className={a === '1' ? `${prefix}-edge-tooltip-content-item-data-arrow-border` : ''} key={a} onClick={() => _onUpdate('relation', a)}>
          <div>
            <Icon
              style={{visibility: a === arrowState[arrowReverse === 'left' ? 0 : 1] ? 'visible' : 'hidden'}}
              type='fa-check'/>
          </div>
          <Svg reverse={arrowReverse === 'left'} type={a} />
        </div>;
      })}
    </div>;
  };
  return <div className={`${prefix}-edge-tooltip-content`}>
    {
      !isLock && <>
        <div className={`${prefix}-edge-tooltip-content-item`}>
          <Icon onClick={() => _onUpdate('label', !isLock)} type='fa-font'/>
        </div>
        <div className={`${prefix}-edge-tooltip-content-line`}/>
        <div
          className={`${prefix}-edge-tooltip-content-item`}
          onMouseLeave={onMouseLeave}
          onMouseOver={e => onMouseOver(e, 'line')}>
          <div className={`${prefix}-edge-tooltip-content-item-line`}>
            <Svg isArrow={false} type={lineState.lineType}/>
          </div>
        </div>
        <div className={`${prefix}-edge-tooltip-content-line`}/>
        <div
          className={`${prefix}-edge-tooltip-content-item`}
          >
          <div className={`${prefix}-edge-tooltip-content-item-arrow`}>
            <Svg
              reverse
              type={arrowState[0]}
              onMouseLeave={onMouseLeave}
              onMouseOver={e => onMouseOver(e, 'arrow', 'left')}
              />
            <div onClick={() => _onUpdate('arrow-exchange')} className={`${prefix}-edge-tooltip-content-item-arrow-change`}>
              <Icon type='fa-exchange'/>
            </div>
            <Svg
              type={arrowState[1]}
              onMouseLeave={onMouseLeave}
              onMouseOver={e => onMouseOver(e, 'arrow', 'right')}
              />
          </div>
        </div>
        <div className={`${prefix}-edge-tooltip-content-line`}/></>
    }
    <div className={`${prefix}-edge-tooltip-content-item`}>
      <Icon onClick={() => _onUpdate('lock', !isLock)} type={`fa-${isLock ? 'lock' : 'unlock'}`}/>
    </div>
    {dataType && ReactDom.createPortal(<div
      onMouseLeave={onMouseLeaveData}
      onMouseOver={onMouseOverData}
      className={`${prefix}-edge-tooltip-content-item-data`}
      style={dataPosition}>
      {renderDataType()}
    </div>, document.body)}
  </div>;
};


const NodeTooltipContent = ({onUpdate, node}) => {
  const parent = node.getParent();
  const [isLock, setIsLock] = useState(() => {
    return node.getProp('isLock');
  });
  // lock
  const _onUpdate = (t, value) => {
    if (t === 'lock') {
      setIsLock(pre => !pre);
    }
    onUpdate(t, value);
  };
  return <div className={`${prefix}-node-tooltip-content`}>
    {!isLock && <div><Icon type='fa-link'/></div>}
    { !parent && <div onClick={() => _onUpdate('lock', !isLock)}><Icon type={`fa-${isLock ? 'lock' : 'unlock'}`}/></div>}
  </div>;
};

export const edgeNodeAddTool = (edge, graph, id, dataChange) => {
  const cellTooltip = document.getElementById(`${id}-cellTooltip`);
  const { container } = graph.findView(edge) || {};
  if (cellTooltip && container) {
    cellTooltip.innerHTML = '';
    const canvasContainer = cellTooltip.parentElement;
    const canvasContainerRect = canvasContainer.getBoundingClientRect();
    const rect = container.getBoundingClientRect();
    let width = edge.isNode() ? 80 : 200;
    let height = 40;

    const toolParent = document.createElement('div');
    toolParent.setAttribute('class', `${prefix}-cell-tooltip`);
    toolParent.style.position = 'absolute';
    toolParent.style.left = `${rect.x - canvasContainerRect.x + rect.width / 2 - width / 2}px`;
    toolParent.style.bottom = `${canvasContainerRect.bottom - rect.top + 5}px`;
    //toolParent.style.width = `${width}px`;
    toolParent.style.height = `${height}px`;
    const onUpdate = (t, v, p) => {
      graph.batchUpdate('updateEdgeOrNode', () => {
        if (t === 'lineType') {
          // straight', 'polyline', 'fillet'
          if (v === 'straight') {
            edge.setProp('router', {
              name: 'normal',
            });
            edge.setProp('vertices', []);
            edge.setProp('connector', {
              name: 'normal',
            });
          } else {
            if (v === 'fillet') {
              edge.setProp('connector', {
                name: 'rounded',
                args: {
                  radius: 10,
                },
              });
            } else {
              edge.setProp('connector', {
                name: 'normal',
              });
            }
            edge.setProp('router', {
              name: 'manhattan',
              args: {
                excludeShapes: ['group'],
              },
            });
          }
        } else if(t === 'lineStyle'){
          if (v === 'dotted-large') {
            edge.attr('line/strokeDasharray', '5 5');
          } else {
            edge.attr('line/strokeDasharray', '');
          }
        } else if(t === 'relation') {
          //edge.setProp('relation', relationArray.join(':') || '1:n');
          if (p === 'left') {
            edge.attr('line/sourceMarker/relation', v);
          } else {
            edge.attr('line/targetMarker/relation', v);
          }
          edge.setProp('relation', `${edge.attr('line/sourceMarker/relation')}:${edge.attr('line/targetMarker/relation')}`);
        } else if (t === 'arrow-exchange') {
          edge.attr('line', {
            sourceMarker: {
              relation: edge.attr('line/targetMarker/relation'),
            },
            targetMarker: {
              relation: edge.attr('line/sourceMarker/relation'),
            },
          });
          edge.setProp('relation', `${edge.attr('line/sourceMarker/relation')}:${edge.attr('line/targetMarker/relation')}`);
        } else if(t === 'lock') {
          edge.setProp('isLock', v);
          graph.cleanSelection();
          if (!v) {
            graph.select(edge);
          }
        } else if (t === 'label') {
          let modal = null;
          let value = edge.getLabelAt(0)?.attrs?.text?.text || '';
          const labelChange = (label) => {
            value = label;
          };
          const onOK = () => {
            edge.setLabels([{
              attrs: {
                text: {
                  text: value,
                },
              },
            }]);
            dataChange && dataChange();
            modal && modal.close();
          };
          const onCancel = () => {
            modal && modal.close();
          };
          modal = openModal(
            <LabelEditor
              label={value}
              labelChange={labelChange}
              />,
              {
                title: <FormatMessage id='canvas.edge.relationLabel'/>,
                buttons: [
                  <Button key='onOK' onClick={onOK} type='primary'>
                    <FormatMessage id='button.ok'/>
                  </Button>,
                  <Button key='onCancel' onClick={onCancel}>
                    <FormatMessage id='button.cancel'/>
                  </Button>,
                ],
              });
        }
        t !== 'label' && dataChange && dataChange();
      });
    };
    ReactDom.render(edge.isNode() ? <NodeTooltipContent onUpdate={onUpdate} node={edge}/>
        : <EdgeTooltipContent onUpdate={onUpdate} edge={edge}/>, toolParent);
    cellTooltip.appendChild(toolParent);
  }
};

export const edgeNodeRemoveTool = (id) => {
  const cellTooltip = document.getElementById(`${id}-cellTooltip`);
  if (cellTooltip) {
    Array.from(cellTooltip.children).forEach((c) => {
      cellTooltip.removeChild(c);
    });
  }
};
