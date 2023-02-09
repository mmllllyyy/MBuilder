import moment from 'moment';
import html2canvas from 'html2canvas';
import React, {useEffect, useRef, useMemo} from 'react';
import { Graph, Addon, DataUri } from '@antv/x6';
import {FormatMessage} from 'components';
import './components';
import {getPrefix} from '../../lib/prefixUtil';
import { img } from '../../lib/generatefile/img';
import FindEntity from './FindEntity';
import ToolBar from './ToolBar';
import clipCanvasEmptyPadding from './_util/clip_canvas';
import * as align from '../../lib/position';
import ER from './chart/ER';
import Mind from './chart/Mind';
import { edgeNodeRemoveTool } from './components/tool';

const { Dnd } = Addon;

export default ({data, dataSource, renderReady, updateDataSource, validateTableStatus, prefix,
                  dataChange, openEntity, tabKey, activeKey, common, tabDataChange,
                  changes, versionsData, save, getDataSource, openDict, selectionChanged,
                  jumpEntity, diagramKey, relationType,changeTab, openTab, closeTab,
                  ...restProps}) => {
  const isView = false;
  const currentPrefix = getPrefix(prefix);
  const isInit = useRef(false);
  const findRef = useRef(null);
  const needRender = useRef(false);
  const graphRef = useRef(null);
  const erRef = useRef(null);
  const mindRef = useRef(null);
  const toolBarRef = useRef(null);
  const interactingRef = useRef(true);
  const dataSourceRef = useRef(dataSource);
  const isDoneInit = useRef(false);
  dataSourceRef.current = dataSource;
  const id = useMemo(() => `er-${Math.uuid()}`, []);
  const isScroll = useRef(false);
  const scrollTimer = useRef(null);
  const render = () => {
    if (!isInit.current) {
      graphRef.current.fromJSON({
        cells: mindRef.current.render(erRef.current.render(data, dataSourceRef.current)),
      });
      isInit.current = true;
    } else {
      erRef.current.update(dataSourceRef.current);
    }
  };
  const undo = () => {
    const cells = graphRef.current.getSelectedCells();
    graphRef.current.cleanSelection();
    graphRef.current.undo({undo: true});
    graphRef.current.resetSelection(cells);
  };
  const redo = () => {
    const cells = graphRef.current.getSelectedCells();
    graphRef.current.cleanSelection();
    graphRef.current.redo({undo: true});
    graphRef.current.resetSelection(cells);
  };
  const setSelection = (status) => {
    if (status) {
      graphRef.current.enableRubberband();
      graphRef.current.scroller.widgetOptions.modifiers = ['ctrl', 'meta'];
    } else {
      graphRef.current.disableRubberband();
      graphRef.current.scroller.widgetOptions.modifiers = [];
    }
  };
  const setMinimap = () => {
    const minimapContainer = document.getElementById(`${id}minimapContainer`);
    if (minimapContainer) {
      if (minimapContainer.style.opacity === '0') {
        minimapContainer.style.opacity = '1';
        minimapContainer.style.pointerEvents = 'auto';
      } else {
        minimapContainer.style.opacity = '0';
        minimapContainer.style.pointerEvents = 'none';
      }
    }
  };
  const sliderChange = (percent) => {
    if (percent === 'fit') {
      graphRef.current.scale(1);
      graphRef.current.centerContent();
    } else {
      graphRef.current.scale(percent * 2 / 100);
    }
  };
  useEffect(() => {
    const container = document.getElementById(id);
    const graph = new Graph({
      async: true,
      container,
      autoResize: false,
      snapline: true,
      translating: {
        restrict(view) {
          const cell = view.cell;
          if (cell.isNode()) {
            const parent = cell.getParent();
            // 限制节点
            if (parent && graph.isSelected(parent)) {
              return parent.getBBox();
            }
          }
          return null;
        },
      },
      history: {
        enabled: true,
        beforeAddCommand(event, args) {
          if (args.key === 'zIndex' || args.key === 'tools' || args.cell.getProp('isTemp')) {
            return false;
          }
          return !args.options.ignoreHistory;
        },
      },
      minimap: {
        enabled: true,
        container: document.getElementById(`${id}minimapContainer`),
        graphOptions: {
          async: true,
          // eslint-disable-next-line consistent-return
          createCellView:(cell) => {
            // 在小地图中不渲染边
            if (cell.isEdge()) {
              return null;
            }
          },
        },
      },
      keyboard: {
        enabled: true,
      },
      clipboard: {
        enabled: true,
        useLocalStorage: true,
      },
      scroller: {
        enabled: true,
        pannable: true,
        modifiers: ['ctrl', 'meta'],
      },
      selecting: {
        enabled: true,
        multiple: true,
        rubberband: true,
        filter(node) {
          return !node.getProp('isLock');
        },
        //modifiers: 'alt|ctrl',
      },
      mousewheel: {
        enabled: true,
        modifiers: ['ctrl', 'meta'],
      },
      connecting: {
        connectionPoint: 'anchor',
        snap: true,
        allowBlank: false,
        allowNode: false,
        createEdge() {
          return erRef.current.createEdge();
        },
        validateConnection({targetPort, targetView, sourcePort,sourceCell}) {
          return !targetView.cell.getProp('isLock') && !sourceCell.getProp('isLock')
              && erRef.current.validateConnection(targetPort, targetView, sourcePort,sourceCell);
        },
      },
      grid: false,
      resizing: isView ? false : {
        minWidth: 80,
        minHeight: 60,
        enabled:  (node) => {
          return !node.getProp('isLock') && erRef.current.resizingEnabled(node);
        },
        preserveAspectRatio: (node) => {
          return erRef.current.preserveAspectRatio(node);
        },
      },
      interacting: ({cell}) => {
        if (isView || cell.getProp('isLock')) return false;
        if (interactingRef.current) {
          return {
            nodeMovable: (cellView) => {
             return erRef.current.interacting(cellView) && mindRef.current.interacting(cellView);
            },
          };
        }
        return false;
      },
      onPortRendered(args) {
        erRef.current.onPortRendered(args);
      },
      embedding: {
        enabled: true,
        findParent({ node }) {
          return erRef.current.findParent(node);
        },
      },
      highlighting: {
        embedding: {
          name: 'stroke',
          args: {
            padding: -1,
            attrs: {
              stroke: '#4e75fd',
            },
          },
        },
      },
      scaling: {
        min: 0.1,
        max: 2,
      },
    });
    graphRef.current = graph;
    const dnd = new Dnd({
      target: graph,
      scaled: false,
      animation: true,
    });
    const eR = new ER(
        {
          // eslint-disable-next-line max-len
      validateTableStatus, updateDataSource, tabKey, relationType, graph, changeTab, dnd, dataChange, tabDataChange, isView, save, openDict, jumpEntity, openTab, closeTab, container, getDataSource, common, changes, versionsData, currentPrefix,
    });
    const mind = new Mind({graph, dnd});
    erRef.current = eR;
    mindRef.current = mind;
    if (!isView) {
      graph.bindKey(['ctrl+c','command+c'], (e) => {
        const cells = graph.getSelectedCells();
        if (e.target.tagName !== 'TEXTAREA' && cells && cells.length) {
          graph.copy(cells);
        } else {
          graph.cleanClipboard();
        }
      });
      graph.bindKey(['ctrl+v','command+v'], (e) => {
        eR.paste(e, dataSourceRef.current);
      });
      graph.bindKey(['ctrl+z','command+z'], () => {
        undo();
      });
      graph.bindKey(['ctrl+shift+z','command+shift+z'], () => {
        redo();
      });
      graph.bindKey(['up','down', 'left', 'right'],(e) => {
        const selectedCells = graph.getSelectedCells()
            .filter(c => c.shape !== 'erdRelation')
            .filter(c => !c.getProp('editable'));
        if (selectedCells.length > 0) {
          e.preventDefault();
          const moveCells = (cells, offset) => {
            if (cells) {
              cells.forEach((c) => {
                const { x, y } = c.getProp('position');
                c.setProp('position', {
                  x: x + offset.x,
                  y: y + offset.y,
                });
                moveCells(c.children, offset);
              });
            }
          };
          graph.batchUpdate(() => {
            let offset = null;
            switch (e.keyCode) {
              case 38: offset = {x: 0, y: -1};break;
              case 39: offset = {x: 1, y: 0};break;
              case 40: offset = {x: 0, y: 1};break;
              case 37: offset = {x: -1, y: 0};break;
              default: offset = {x: 0, y: 0};break;
            }
            moveCells(selectedCells, offset);
          });
        }
      });
      graph.bindKey('tab', (e) => {
        e.preventDefault();
        mind.createTopicNode(e, false);
      });
    }
    graph.bindKey(['ctrl+m','command+m'], (e) => {
      e.preventDefault();
      setMinimap();
      toolBarRef.current.setMinimap();
    });
    graph.bindKey(['ctrl+f','command+f'], (e) => {
      e.preventDefault();
      const ersearchContainer = document.getElementById(`${id}ersearch`);
      if (ersearchContainer) {
        if (ersearchContainer.style.display === 'none') {
          ersearchContainer.style.display = 'block';
          findRef.current?.focus();
        } else {
          ersearchContainer.style.display = 'none';
        }
      }
    });
    graph.on('render:done', () => {
      graph.mousewheel.container.onscroll = (e) => {
        isScroll.current = true;
        if (scrollTimer.current) {
          clearTimeout(scrollTimer.current);
        }
        scrollTimer.current = setTimeout(() => {
          isScroll.current = false;
        }, 100);
        edgeNodeRemoveTool(id);
        eR.onScroll(e);
      };
      if (!isDoneInit.current) {
        graphRef.current.centerContent();
        isDoneInit.current = true;
      }
    });
    if (!isView) {
      graph.on('cell:changed', ({options}) => {
        // eslint-disable-next-line max-len
        if (!((Object.keys(options).length === 0) || (options.ignoreHistory && !options.relation))) {
          // 过滤掉无需保存的数据
          dataChange && dataChange(graph.toJSON({diff: true}));
        }
      });
      graph.on('cell:removed', ({cell}) => {
        eR.cellRemoved(cell);
        dataChange && dataChange(graph.toJSON({diff: true}));
      });
      graph.on('cell:added', () => {
        dataChange && dataChange(graph.toJSON({diff: true}));
      });
      graph.on('cell:click', ({cell}) => {
        eR.cellClick(cell, graph, id);
      });
      graph.on('blank:click', () => {
        edgeNodeRemoveTool(id);
      });
      graph.on('selection:changed', ({ added,removed }) => {
        eR.selectionChanged(added, removed);
        mind.selectionChanged(added, removed);
        selectionChanged && selectionChanged(graph.getSelectedCells().filter(c => !c.getProp('isLock')));
      });
      graph.on('node:selected', ({ node }) => {
        eR.nodeSelected(node, graph, id);
      });
      graph.on('node:unselected', ({ node }) => {
        edgeNodeRemoveTool(id);
        node.removeTools();
      });
      graph.on('edge:removed', ({edge}) => {
        eR.edgeRemoved(edge);
      });
      graph.on('edge:connected', (args) => {
        eR.edgeConnected(args, dataSourceRef.current);
      });
      // graph.on('edge:contextmenu', ({cell, e}) => {
      // });
      graph.on('edge:change:target', (cell) => {
        eR.edgeChangeTarget(cell);
      });
      graph.on('edge:change:source', (cell) => {
        eR.edgeChangeSource(cell);
      });
      graph.on('edge:mouseup', ({edge}) => {
        eR.edgeMouseup(edge);
      });
      graph.on('edge:added', ({edge, options}) => {
        eR.edgeAdded(edge, options);
      });
      graph.on('edge:selected', ({ edge }) => {
        eR.edgeSelected(edge, graph, id);
      });
      graph.on('edge:unselected', ({ edge }) => {
        edgeNodeRemoveTool(id);
        edge.removeTools();
      });
      graph.on('edge:change:labels', () => {
        dataChange && dataChange(graph.toJSON({diff: true}));
      });
      graph.on('cell:mousedown', ({e}) => {
        interactingRef.current = !(e.ctrlKey || e.metaKey);
      });
      graph.bindKey(['backspace', 'delete'], () => {
        eR.delete();
      });
      graph.on('node:contextmenu', ({cell, e}) => {
        mind.nodeContextmenu(e, cell);
      });
      graph.on('node:added', ({cell, options}) => {
        eR.nodeAdded(cell, options, dataSourceRef.current);
      });
      graph.on('node:mouseenter', ({node}) => {
        eR.nodeMouseEnter(node, graph, id, isScroll.current);
      });
      graph.on('node:mouseleave', ({node}) => {
        eR.nodeMouseLeave(node);
      });
      graph.on('node:move', () => {
        edgeNodeRemoveTool(id);
      });
      graph.on('node:moved', ({node}) => {
        eR.nodeMoved(node, graph, id);
      });
      graph.on('scale', (scale) => {
        toolBarRef.current.scaleChange(scale.sx);
      });
      graph.history.on('undo', (args) => {
        console.log(args);
      });
    }
    graph.on('node:dblclick', ({cell, e}) => {
      eR.nodeDbClick(e, cell, dataSourceRef.current);
    });
    graph.on('edge:mouseenter', ({edge}) => {
      eR.edgeOver(edge, graph, id, isScroll.current);
    });
    graph.on('edge:mouseleave', ({edge}) => {
      eR.edgeLeave(edge);
    });
    graph.on('edge:move', () => {
      edgeNodeRemoveTool(id);
    });
    graph.on('edge:moved', ({edge}) => {
      eR.edgeMoved(edge, graph, id);
    });
    graph.history.on('change', () => {
      toolBarRef.current.historyChange(graph.history);
    });
    const startDrag = (e, key) => {
      eR.startDrag(e, key, dataSourceRef.current);
    };
    const startRemarkDrag = (e, type) => {
      eR.startRemarkDrag(e, type);
    };
    const startGroupNodeDrag = (e) => {
      eR.startGroupNodeDrag(e);
    };
    const startPolygonNodeDrag = (e) => {
      eR.startPolygonNodeDrag(e);
    };
    const createCircleNode = (e) => {
      eR.createCircleNode(e);
    };
    const createTopicNode = (e) => {
      mind.createTopicNode(e, true);
    };
    const alignment = (a) => {
      const cells = graph.getSelectedCells();
      graph.cleanSelection();
      graph.batchUpdate(() => {
        const cellsPosition = align[a](cells);
        const calcChildren = (children , offset) => {
          (children || []).forEach((child) => {
            const { x, y } = child.getProp('position');
            child.setProp('position', {x: x + offset.x, y: y + offset.y});
            calcChildren(child.children, offset);
          });
        };
        cells.forEach((c) => {
          const currentCell = cellsPosition.filter(p => p.id === c.id)[0];
          if (currentCell) {
            const { x, y } = c.getProp('position');
            c.setProp('position', {x: currentCell.x, y: currentCell.y});
            calcChildren(c.children, {x: currentCell.x - x, y: currentCell.y - y});
          }
        });
      });
      graph.resetSelection(cells);
    };
    const getScaleNumber = () => {
      return graph.scale();
    };
    const updateColor = (key, color) => {
      eR.updateColor(key, color, dataSourceRef.current);
    };
    const validateScale = (factor) => {
      graph.zoom(factor);
    };
    const update = () => {
      eR.update(dataSource.current);
    };
    renderReady && renderReady({
      update,
      startDrag,
      startRemarkDrag,
      startGroupNodeDrag,
      startPolygonNodeDrag,
      createCircleNode,
      createTopicNode,
      validateScale,
      getScaleNumber,
      updateColor,
      alignment,
      exportImg: () => {
        restProps.openLoading(FormatMessage.string({id: 'toolbar.exportImgLoading'}));
        img(graph.toJSON().cells, relationType,null, false).then((dom) => {
          html2canvas(dom).then((canvas) => {
            document.body.removeChild(dom.parentElement.parentElement);
            const diagram = (dataSourceRef.current?.diagrams || [])
                .filter(d => d.id === diagramKey)[0] || {};

            const clippedCanvas = clipCanvasEmptyPadding(canvas, 30);
            restProps.closeLoading();
            DataUri.downloadDataUri(clippedCanvas.toDataURL('image/png'),
                `${dataSourceRef.current.name}-${diagram.defKey}[${diagram.defName || diagram.defKey}]-${moment().format('YYYYMDHHmmss')}.png`);
          });
        });
      },
    });
  }, []);
  useEffect(() => {
    if (activeKey === tabKey) {
      render();
    } else {
      needRender.current = true;
    }
  }, [
    dataSource.domains,
    dataSource.dicts,
    dataSource.uiHint,
    dataSource.entities,
    dataSource?.profile?.default?.db,
  ]);
  useEffect(() => {
    const dom = document.getElementById(id);
    if (dom?.clientWidth > 0) {
      graphRef.current.resize(restProps.width, restProps.height);
    }
  }, [restProps.width, restProps.height]);
  useEffect(() => {
    if (activeKey === tabKey && needRender.current) {
      render();
      needRender.current = false;
    }
  }, [activeKey]);
  const getGraph = () => {
    return graphRef?.current;
  };
  return <>
    <div
      id={id}
      style={{height: '100%'}}
    >{}</div>
    <div style={{display: 'none'}} className={`${currentPrefix}-er-search`} id={`${id}ersearch`}>
      <FindEntity ref={findRef} prefix={currentPrefix} getGraph={getGraph} dataSource={dataSource}/>
    </div>
    <div
      style={{opacity: 0, pointerEvents: 'none'}}
      className={`${currentPrefix}-er-minimapContainer`}
      id={`${id}minimapContainer`}
    >
      {}
    </div>
    <div id={`${id}-cellTooltip`} />
    <ToolBar
      undo={undo}
      redo={redo}
      isView={isView}
      ref={toolBarRef}
      sliderChange={sliderChange}
      setSelection={setSelection}
      setMinimap={setMinimap}
    />
  </>;
};
