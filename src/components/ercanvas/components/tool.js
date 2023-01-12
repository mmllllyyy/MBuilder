import { Graph, ToolsView } from '@antv/x6';
import ReactDom from 'react-dom';
import React, {useRef, useState} from 'react';
import { Icon } from 'components';
import { prefix } from '../../../../profile';

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
          cell.attr('text/text', e.target.value, { ignoreHistory : true});
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
    return this;
  }
}

ShowSizeTool.config({
  tagName: 'div',
  isSVGElement: false,
});

Graph.registerNodeTool('showSizeTool', ShowSizeTool, true);


// 节点或边的工具栏
const EdgeTooltipContent = () => {
  const [dataPosition, setDataPosition] = useState({left: 0, bottom: -40});
  const [dataType, setDataType] = useState('');
  const isLeave = useRef(true);
  const time = useRef(null);
  const checkLeave = () => {
    clearTimeout(time.current);
    time.current = setTimeout(() => {
      if (isLeave.current) {
        setDataType('');
      }
    }, 300);
  };
  const onMouseOver = (e, type) => {
    isLeave.current = false;
    checkLeave();
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    setDataType(type);
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
            <div />
            <div />
          </div>
        </div>
        <div>
          <div>线条样式</div>
          <div>
            <div />
            <div />
          </div>
        </div>
      </div>;
    }
    return <div className={`${prefix}-edge-tooltip-content-item-data-arrow`}>
      <div>
        <div><Icon type='fa-check'/></div>
        <div />
      </div>
      <div>
        <div><Icon type='fa-check'/></div>
        <div />
      </div>
      <div>
        <div><Icon type='fa-check'/></div>
        <div />
      </div>
      <div>
        <div><Icon type='fa-check'/></div>
        <div />
      </div>
      <div>
        <div><Icon type='fa-check'/></div>
        <div />
      </div>
      <div>
        <div><Icon type='fa-check'/></div>
        <div />
      </div>
      <div>
        <div><Icon type='fa-check'/></div>
        <div />
      </div>
    </div>;
  };
  return <div className={`${prefix}-edge-tooltip-content`}>
    <div
      className={`${prefix}-edge-tooltip-content-item`}
      onMouseLeave={onMouseLeave}
      onMouseOver={e => onMouseOver(e, 'line')}>
      <div className={`${prefix}-edge-tooltip-content-item-line-straight`}/>
    </div>
    <div className={`${prefix}-edge-tooltip-content-line`}/>
    <div
      className={`${prefix}-edge-tooltip-content-item`}
      >
      <div className={`${prefix}-edge-tooltip-content-item-arrow`}>
        <div
          className={`${prefix}-edge-tooltip-content-item-arrow-fill`}
          onMouseLeave={onMouseLeave}
          onMouseOver={e => onMouseOver(e, 'arrow', 'left')}/>
        <div className={`${prefix}-edge-tooltip-content-item-arrow-change`}>
          <Icon type='fa-exchange'/>
        </div>
        <div
          style={{transform: 'rotate(180deg)'}}
          className={`${prefix}-edge-tooltip-content-item-arrow-fill`}
          onMouseLeave={onMouseLeave}
          onMouseOver={e => onMouseOver(e, 'arrow', 'right')}/>
      </div>
    </div>
    <div className={`${prefix}-edge-tooltip-content-line`}/>
    <div className={`${prefix}-edge-tooltip-content-item`}><Icon type='fa-unlock'/></div>
    {dataType && ReactDom.createPortal(<div
      onMouseLeave={onMouseLeaveData}
      onMouseOver={onMouseOverData}
      className={`${prefix}-edge-tooltip-content-item-data`}
      style={dataPosition}>
      {renderDataType()}
    </div>, document.body)}
  </div>;
};


const NodeTooltipContent = () => {
  return <div className={`${prefix}-node-tooltip-content`}>
    <div><Icon type='fa-link'/></div>
    <div><Icon type='fa-unlock'/></div>
  </div>;
};

export const edgeNodeAddTool = (edge, graph, id, type) => {
  const cellTooltip = document.getElementById(`${id}-cellTooltip`);
  if (cellTooltip) {
    const canvasContainer = cellTooltip.parentElement;
    const canvasContainerRect = canvasContainer.getBoundingClientRect();
    const { container } = graph.findView(edge);
    const rect = container.getBoundingClientRect();
    let width = type === 'node' ? 80 : 200;
    let height = 40;

    const toolParent = document.createElement('div');
    toolParent.setAttribute('class', `${prefix}-cell-tooltip`);
    toolParent.style.position = 'absolute';
    toolParent.style.left = `${rect.x - canvasContainerRect.x + rect.width / 2 - width / 2}px`;
    toolParent.style.bottom = `${canvasContainerRect.bottom - rect.top + 5}px`;
    toolParent.style.width = `${width}px`;
    toolParent.style.height = `${height}px`;
    ReactDom.render(type === 'node' ? <NodeTooltipContent/> : <EdgeTooltipContent/>, toolParent);
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
