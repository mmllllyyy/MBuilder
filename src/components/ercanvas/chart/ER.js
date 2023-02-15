import {Button, FormatMessage, Message, Modal, openDrawer} from 'components';
import React from 'react';
import _ from 'lodash/object';
import {Shape} from '@antv/x6';
import ReactDOM from 'react-dom';
import {getChildrenCell} from 'components/ercanvas/components/util';
import {
    calcCellData,
    calcNodeData,
    generatorTableKey,
    getEmptyEntity,
    mapData2Table,
    resetHeader,
} from '../../../lib/datasource_util';
import {separator} from '../../../../profile';
import {getDataByTabId} from '../../../lib/cache';
import Entity from '../../../app/container/entity';
import { edgeNodeAddTool} from '../components/tool';
import {openUrl} from '../../../lib/json2code_util';

export default class ER {
    currentColor = {
        selected: '#1890FF', // 选中色
        border: '#DFE3EB', // 边框色
        fillColor: '#ACDAFC', // 节点和边的背景色
        fontColor: '#000000', // 节点字体色
        circleFill: '#FFF', // 锚点填充色
    };
    commonPort = {
        attrs: {
            fo: {
                width: 8,
                height: 8,
                x: -4,
                y: -4,
                magnet: 'true',
                style: {
                    visibility: 'hidden',
                },
            },
        },
        zIndex: 3,
    }
    commonPorts = {
        groups: {
            in: {
                ...this.commonPort,
                position: { name: 'left' },
            },
            out: {
                ...this.commonPort,
                position: { name: 'right' },
            },
            top: {
                ...this.commonPort,
                position: { name: 'top' },
            },
            bottom: {
                ...this.commonPort,
                position: { name: 'bottom' },
            },
        },
        items: [
            {group: 'in', id: 'in'},
            {group: 'in', id: 'in2'},
            {group: 'in', id: 'in3'},
            {group: 'out', id: 'out'},
            {group: 'out', id: 'out2'},
            {group: 'out', id: 'out3'},
            {group: 'top', id: 'top'},
            {group: 'top', id: 'top2'},
            {group: 'top', id: 'top3'},
            {group: 'bottom', id: 'bottom'},
            {group: 'bottom', id: 'bottom2'},
            {group: 'bottom', id: 'bottom3'},
        ],
    };
    commonEntityPorts = {
        groups: {
            in: {
                attrs: {
                    circle: {
                        r: 4,
                        magnet: true,
                        stroke: this.currentColor.selected,
                        fill: this.currentColor.circleFill,
                        strokeWidth: 1,
                        style: {
                            visibility: 'hidden',
                        },
                    },
                },
                zIndex: 3,
                position: { name: 'left' },
            },
            out: {
                attrs: {
                    circle: {
                        r: 4,
                        magnet: true,
                        stroke: this.currentColor.selected,
                        fill: this.currentColor.circleFill,
                        strokeWidth: 1,
                        style: {
                            visibility: 'hidden',
                        },
                    },
                },
                position: { name: 'right' },
            },
            top: {
                attrs: {
                    circle: {
                        r: 4,
                        magnet: true,
                        stroke: this.currentColor.selected,
                        fill: this.currentColor.circleFill,
                        strokeWidth: 1,
                        style: {
                            visibility: 'hidden',
                        },
                    },
                },
                position: { name: 'top' },
            },
            bottom: {
                attrs: {
                    circle: {
                        r: 4,
                        magnet: true,
                        stroke: this.currentColor.selected,
                        fill: this.currentColor.circleFill,
                        strokeWidth: 1,
                        style: {
                            visibility: 'hidden',
                        },
                    },
                },
                position: { name: 'bottom' },
            },
        },
        items: [
            {group: 'in', id: 'in'},
            {group: 'in', id: 'in2'},
            {group: 'in', id: 'in3'},
            {group: 'out', id: 'out'},
            {group: 'out', id: 'out2'},
            {group: 'out', id: 'out3'},
            {group: 'top', id: 'top'},
            {group: 'top', id: 'top2'},
            {group: 'top', id: 'top3'},
            {group: 'bottom', id: 'bottom'},
            {group: 'bottom', id: 'bottom2'},
            {group: 'bottom', id: 'bottom3'},
        ],
    };
    defaultEditNodeSize = {
        width: 80,
        height: 60,
        minHeight: 20,
    };
    defaultEditNodeCircleSize = {
        width: 80,
        height: 60,
        minHeight: 20,
    };
    defaultGroupNodeSize = {
        width: 240,
        height: 160,
        minHeight: 160,
    };
    defaultEditNodePolygonSize = {
        width: 80,
        height: 80,
        minHeight: 20,
    };
    commonPolygonPorts = {
        groups: {
            in: {
                ...this.commonPort,
                position: { name: 'left' },
            },
            out: {
                ...this.commonPort,
                position: { name: 'right' },
            },
            top: {
                ...this.commonPort,
                position: { name: 'top' },
            },
            bottom: {
                ...this.commonPort,
                position: { name: 'bottom' },
            },
        },
        items: [
            {group: 'in', id: 'in'},
            {group: 'out', id: 'out'},
            {group: 'top', id: 'top'},
            {group: 'bottom', id: 'bottom'},
        ],
    };
    constructor({validateTableStatus, updateDataSource, relationType, graph, changeTab,
                    dnd, dataChange, tabDataChange, isView, save, openDict, jumpEntity,
                    openTab, closeTab, getDataSource, common, changes, versionsData,
                    currentPrefix, container, tabKey}) {
        this.validateTableStatus = validateTableStatus;
        this.updateDataSource = updateDataSource;
        this.relationType = relationType;
        this.graph = graph;
        this.dnd = dnd;
        this.dataChange = dataChange;
        this.tabDataChange = tabDataChange;
        this.isView = isView;
        this.save = save;
        this.openDict = openDict;
        this.jumpEntity = jumpEntity;
        this.changeTab = changeTab;
        this.openTab = openTab;
        this.closeTab = closeTab;
        this.getDataSource = getDataSource;
        this.common = common;
        this.changes = changes;
        this.versionsData = versionsData;
        this.currentPrefix = currentPrefix;
        this.container = container;
        this.tabKey = tabKey;
    }
    filterErCell = (cells) => {
        // 菱形 圆角矩形 原形 分组 连线 数据表 矩形
        const erCells =
            ['edit-node-polygon', 'edit-node-circle-svg',
                'edit-node-circle', 'group', 'erdRelation', 'table', 'edit-node'];
        return ([].concat(cells)).filter((c) => {
            return erCells.includes(c.shape);
        });
    }
    isErCell = (cell) => {
        return this.filterErCell(cell).length > 0;
    }
    updateFields = (dataSource, originKey, fields) => {
        if (!this.validateTableStatus(`${originKey}${separator}entity`)) {
            const getKey = (f) => {
                return `${f.defKey}${f.defName}`;
            };
            const result = {};
            const newDataSource = {
                ...dataSource,
                entities: dataSource.entities.map((e) => {
                    if (e.id === originKey) {
                        const success = fields
                            .filter(f => (e.fields || [])
                                .findIndex(eFiled => getKey(eFiled) === getKey(f)) < 0);
                        result.success = success.length;
                        result.hidden = success.filter(f => f.hideInGraph).length;
                        return {
                            ...e,
                            // eslint-disable-next-line max-len
                            fields: (e.fields || []).concat(success.map(s => ({...s, isStandard: true}))),
                        };
                    }
                    return e;
                }),
            };
            this.updateDataSource && this.updateDataSource(newDataSource);
            if (result.success === fields.length) {
                Message.success({title: FormatMessage.string({id: 'optSuccess'})});
            } else {
                Modal.info({
                    title: <FormatMessage id='optEnd'/>,
                    message: <div>
                      {result.success > 0 && <div>
                        <FormatMessage
                          id='standardFields.dropFieldsSuccessResult'
                          data={{success: result.success}}
                            />
                            (
                        <FormatMessage
                          id='standardFields.dropFieldsShowResult'
                          data={{show: result.success - result.hidden}}
                            />{result.hidden > 0 && <FormatMessage
                              id='standardFields.dropFieldsHiddenResult'
                              data={{hidden: result.hidden}}
                        />})</div>}
                      <div>
                        <FormatMessage
                          id='standardFields.dropFieldsFailResult'
                          data={{fail: fields.length - result.success}}
                            />
                      </div>
                    </div>,
                });
            }
        } else {
            Modal.error({
                title: <FormatMessage id='optFail'/>,
                message: <FormatMessage id='canvas.node.entityHasOpen'/>,
            });
        }
    };
    getTableGroup = () => {
        return {
            in: {
                attrs: {
                    circle: {
                        r: 4,
                        magnet: true,
                        stroke: this.currentColor.selected,
                        fill: this.currentColor.circleFill,
                        strokeWidth: 1,
                        style: {
                            visibility: 'hidden',
                        },
                    },
                },
                position: { name: 'absolute' },
                zIndex: 3,
            },
            out: {
                attrs: {
                    circle: {
                        r: 4,
                        magnet: true,
                        stroke: this.currentColor.selected,
                        fill: this.currentColor.circleFill,
                        strokeWidth: 1,
                        style: {
                            visibility: 'hidden',
                        },
                    },
                },
                position: { name: 'absolute' },
                zIndex: 3,
            },
            extend: {
                attrs: {
                    circle: {
                        r: 4,
                        magnet: true,
                        stroke: this.currentColor.selected,
                        fill: this.currentColor.circleFill,
                        strokeWidth: 1,
                        style: {
                            visibility: 'hidden',
                        },
                    },
                },
                position: { name: 'absolute' },
                zIndex: 3,
            },
        };
    };
    getEntityInitFields = (dataSource) => {
        return _.get(dataSource, 'profile.default.entityInitFields', [])
            .map((f) => {
                return {
                    ...f,
                    id: Math.uuid(),
                };
            });
    };
    getEntityInitProperties = (dataSource) => {
        return _.get(dataSource, 'profile.default.entityInitProperties', {});
    };
    startDrag = (e, key, dataSource) => {
        let empty;
        let count = 0;
        if (!key) {
            empty = {
                ...getEmptyEntity(),
                headers: resetHeader(dataSource, {}),
                count: 0,
                defKey: generatorTableKey('TABLE_1', dataSource),
                defName: '数据表',
                fields: this.getEntityInitFields(dataSource),
                properties: this.getEntityInitProperties(dataSource),
            };
        } else {
            const dataSourceEntity = dataSource?.entities
                ?.filter(entity => entity.id === key)[0];
            empty = {
                ...dataSourceEntity,
            };
            count = this.graph.getNodes().filter(n => n.data?.id === key).length;
        }
        if (!empty) {
            return;
        }
        const { width, height, fields, headers, maxWidth, ports } =
            calcNodeData(empty, empty, dataSource, this.getTableGroup());
        const node =  this.graph.createNode({
            size: {
                width,
                height,
            },
            shape: 'table',
            ports: this.relationType === 'entity' ? this.commonEntityPorts : ports,
            originKey: empty.id,
            count,
            updateFields: (originKey, fieldData) =>
                this.updateFields(dataSource, originKey, fieldData),
            nodeClickText: this.nodeTextClick,
            data: {
                ...empty,
                fields,
                headers,
                maxWidth,
            },
        });
        this.dnd.start(node, e.nativeEvent);
    };
    startRemarkDrag = (e, type) => {
        const shape = type === 'rect' ? 'edit-node' : 'edit-node-circle';
        const size = type === 'rect' ? this.defaultEditNodeSize : this.defaultEditNodeCircleSize;
        const node =  this.graph.createNode({
            shape: shape,
            label: '',
            size: size,
            ports: this.commonPorts,
            nodeClickText: this.nodeTextClick,
        });
        this.dnd.start(node, e.nativeEvent);
    };
    startGroupNodeDrag = (e) => {
        const node =  this.graph.createNode({
            shape: 'group',
            label: '',
            size: this.defaultGroupNodeSize,
            nodeClickText: this.nodeTextClick,
        });
        this.dnd.start(node, e.nativeEvent);
    };
    startPolygonNodeDrag = (e) => {
        const node =  this.graph.createNode({
            shape: 'edit-node-polygon',
            label: '',
            size: this.defaultEditNodePolygonSize,
            ports: this.commonPolygonPorts,
            nodeClickText: this.nodeTextClick,
        });
        this.dnd.start(node, e.nativeEvent);
    };
    createCircleNode = (e) => {
        const node =  this.graph.createNode({
            shape: 'edit-node-circle-svg',
            label: '',
            size: this.defaultEditNodePolygonSize,
            ports: this.commonPolygonPorts,
        });
        this.dnd.start(node, e.nativeEvent);
    };
    nodeTextClick = (node) => {
        const link = JSON.parse(node.getProp('link') || '{}');
        if (link.type) {
            if (link.type === 'externally') {
                openUrl(link.value);
            } else {
                const iconMap = {
                    entities: 'fa-table',
                    views: 'icon-shitu',
                    diagrams: 'icon-guanxitu',
                    dicts: 'icon-shujuzidian',
                };
                const keyMap = {
                    entities: 'entity',
                    views: 'view',
                    diagrams: 'diagram',
                    dicts: 'dict',
                };
                // openDict(data.id, 'dict', null, 'dict.svg');
                const dataSource = this.getDataSource();
                const currenTab = Object.keys(iconMap).filter((i) => {
                    return dataSource[i].some(d => d.id === link.value);
                })[0];
                if (currenTab) {
                    this.openDict(link.value, keyMap[currenTab], null, iconMap[currenTab]);
                } else {
                    Message.error({title: `${FormatMessage.string({id: 'canvas.node.invalidLink'})}`});
                }
            }
        }
        //console.log(node);
    }
    render = (data, dataSource) => {
        return calcCellData(data?.canvasData?.cells || [],
            dataSource,
            (originKey, fields) => this.updateFields(dataSource, originKey, fields),
            this.getTableGroup(), this.commonPorts, this.relationType,
            this.commonEntityPorts, this.nodeTextClick);
    }
    update = (dataSource) => {
        const cells = this.graph.getCells();
        this.graph.batchUpdate('update', () => {
            cells.filter(c => c.shape === 'table').forEach((c) => {
                const { size, ports, ...rest } = mapData2Table({
                        originKey: c.data.id,
                        ports: c.ports,
                        data: c.getProp('data'),
                    },
                    dataSource,
                    (originKey, fields) => this.updateFields(dataSource, originKey, fields),
                    this.getTableGroup(),
                    this.commonPorts, this.relationType, this.commonEntityPorts,
                    this.nodeTextClick) || {};
                if (size) {
                    // 需要取消撤销重做的记录
                    c.setProp('data', rest.data, { ignoreHistory : true});
                    c.setProp('size', size, { ignoreHistory : true});
                    c.setProp('ports', ports, { ignoreHistory : true});
                } else {
                    this.graph.removeCell(c, { ignoreHistory : true});
                }
            });
        });
    }
    addEntityData = (cell, type, dataSource) => {
        const cells = [].concat(cell);
        let initData = {};
        if (type === 'create') {
            initData = {
                headers: resetHeader(dataSource, {}),
                fields: this.getEntityInitFields(),
                properties: this.getEntityInitProperties(),
            };
        }
        return {
            ...dataSource,
            entities: dataSource.entities.concat(cells.map(c => ({
                ...(c.data ? dataSource
                    .entities.filter(e => e.defKey === c.data.copyDefKey)[0] : {}),
                ..._.pick(c.data, ['id', 'defKey']),
                ...initData,
                serialId: null,
            }))),
            viewGroups: (dataSource.viewGroups || []).map((g) => {
                if ((g.refDiagrams || []).includes(this.tabKey.split(separator)[0])) {
                    return {
                        ...g,
                        refEntities: (g.refEntities || []).concat(cells.map(c => c.data.id)),
                    };
                }
                return g;
            }),
        };
    };
    paste = (e, dataSource) => {
        const cells = this.graph.paste();
        const keys = [];
        cells.forEach((c) => {
            c.removeTools();
            if (c.shape === 'table') {
                c.setProp('updateFields', (originKey, fieldData) =>
                    this.updateFields(dataSource, originKey, fieldData), { ignoreHistory : true});
            }
            c.setProp('nodeClickText', this.nodeTextClick, { ignoreHistory : true});
            c.attr('body', {
                stroke: c.shape === 'group' ? '#000000' : this.currentColor.border,
                strokeWidth: 1,
            }, { ignoreHistory : true});
        });
        const copyEntities = cells
            .filter(c => c.shape === 'table').map((c) => {
                const copyDefKey = c.getData().defKey || '';
                const tempKey = /_(\d)+$/.test(copyDefKey) ? copyDefKey : `${copyDefKey}_1`;
                const newKey = generatorTableKey(tempKey, {
                    entities: (dataSource.entities || []).concat(keys),
                });
                const entityId = Math.uuid();
                keys.push({defKey: newKey});
                c.setProp('originKey', entityId, {ignoreHistory : true});
                c.setData({defKey: newKey, copyDefKey}, {ignoreHistory : true, relation: true});
                c.setData({id: entityId}, {ignoreHistory : true, relation: true});
                return {
                    data: c.data,
                };
            });
        this.updateDataSource && this.updateDataSource(this.addEntityData(copyEntities, 'copy', dataSource));
    }
    nodeDbClick = (e, cell, dataSource) => {
        if (this.isErCell(cell)) {
            if (cell.shape === 'table') {
                const cellData = cell.getData();
                const key = cell.getProp('originKey');
                const group = dataSource?.viewGroups?.
                filter(v => v.refEntities?.some(r => r === key))[0]?.id || '';
                const entityTabKey = `${key + separator}entity`;
                if (!this.validateTableStatus(entityTabKey)) {
                    let drawer;
                    const tab = {
                        type: 'entity',
                        tabKey: entityTabKey,
                    };
                    const onOK = () => {
                        this.save((fail) => {
                            if (!fail) {
                                drawer.close();
                            }
                        });
                    };
                    const onCancel = () => {
                        drawer.close();
                    };
                    const entityChange = (cData) => {
                        this.tabDataChange && this.tabDataChange(cData, tab);
                    };
                    const beforeClose = () => {
                        return new Promise((resolve) => {
                            const tabData = getDataByTabId(tab.tabKey);
                            if (tabData && !tabData?.isInit) {
                                Modal.confirm({
                                    title: FormatMessage.string({id: 'saveConfirmTitle'}),
                                    message: FormatMessage.string({id: 'saveConfirm'}),
                                    onOk:() => {
                                        resolve();
                                    },
                                });
                            } else {
                                resolve();
                            }
                        });
                    };
                    const _openDict = (...args) => {
                        this.openDict && this.openDict(...args);
                        drawer.close();
                    };
                    drawer = openDrawer(<Entity
                      changeTab={this.changeTab}
                      openTab={this.openTab}
                      closeTab={this.closeTab}
                      openDict={_openDict}
                      getDataSource={this.getDataSource}
                      tabKey={entityTabKey}
                      common={this.common}
                      updateDataSource={this.updateDataSource}
                      dataSource={dataSource}
                      entity={key}
                      group={group}
                      tabDataChange={entityChange}
                      changes={this.changes}
                      versionsData={this.versionsData}
                    />, {
                        beforeClose,
                        maskClosable: false,
                        title: cellData.defName || cellData.defKey,
                        width: '80%',
                        buttons: [
                          <Button key='onSave' onClick={onOK} type='primary'>
                            <FormatMessage id='button.save'/>
                          </Button>,
                          <Button key='onCancel' onClick={onCancel}>
                            <FormatMessage id='button.cancel'/>
                          </Button>,
                        ],
                    });
                } else {
                    this.jumpEntity(entityTabKey);
                }
            } else if (!this.isView && !cell.getProp('isLock')) {
                if (cell.shape === 'edit-node'
                    || cell.shape === 'edit-node-circle'
                    || cell.shape === 'group') {
                    if (cell.shape === 'group') {
                        // 暂时隐藏所有的子节点
                        this.graph.batchUpdate('hideChildren',() => {
                            const cells = getChildrenCell(cell, this.graph.getCells());
                            if (cells) {
                                cells.forEach((c) => {
                                    c.hide({ ignoreHistory : true});
                                });
                            }
                        });
                    }
                    cell.setProp('editable', true, { ignoreHistory : true});
                } else if (cell.shape === 'edit-node-polygon' || cell.shape === 'edit-node-circle-svg') {
                    cell.setProp('editable', true, { ignoreHistory : true});
                    const p = this.graph.clientToGraph(e.clientX, e.clientY);
                    cell.removeTools();
                    cell.addTools([
                        {
                            name: 'showSizeTool',
                        },
                        {
                            name: 'editableCell',
                            args: {
                                x: p.x,
                                y: p.y,
                            },
                        },
                    ]);
                }
            }
        }
    }
    edgeOver = (edge, graph, id, isScroll) => {
        if (this.isErCell(edge)) {
            const sourceNode = edge.getSourceCell();
            const targetNode = edge.getTargetCell();
            sourceNode?.setProp('sourcePort', edge.getSourcePortId(), { ignoreHistory : true});
            targetNode?.setProp('targetPort', edge.getTargetPortId(), { ignoreHistory : true});
            edge.attr('line/stroke', this.currentColor.selected, { ignoreHistory : true});
            edge.attr('line/sourceMarker/fillColor', this.currentColor.selected, { ignoreHistory : true});
            edge.attr('line/targetMarker/fillColor', this.currentColor.selected, { ignoreHistory : true});
        }
        if (!isScroll && graph.isSelected(edge)) {
            edgeNodeAddTool(edge, graph, id, () => {
                this.dataChange && this.dataChange(this.graph.toJSON({diff: true}));
            }, this.getDataSource, this.updateDataSource);
        }

    }
    edgeLeave = (edge) => {
        if (this.isErCell(edge)) {
            const sourceNode = edge.getSourceCell();
            const targetNode = edge.getTargetCell();
            sourceNode?.setProp('sourcePort','', { ignoreHistory : true});
            targetNode?.setProp('targetPort', '', { ignoreHistory : true});
            edge.attr('line/stroke', edge.getProp('fillColor') ||
                this.currentColor.fillColor, { ignoreHistory : true});
            edge.attr('line/sourceMarker/fillColor', edge.getProp('fillColor') ||
                this.currentColor.fillColor, { ignoreHistory : true});
            edge.attr('line/targetMarker/fillColor', edge.getProp('fillColor') ||
                this.currentColor.fillColor, { ignoreHistory : true});
        }

    }
    cellRemoved = (cell) => {
        if (cell.shape === 'table') {
            const count = cell.getProp('count');
            this.graph.batchUpdate('count', () => {
                this.graph.getNodes()
                    .filter(n => n.shape === 'table' &&
                        n.getProp('count') &&
                        n.getProp('count') > count)
                    .forEach((n) => {
                        n.setProp('count', n.getProp('count') - 1, { ignoreHistory : true});
                    });
            });
        }
    }
    changePortsVisible = (visible, node, source) => {
        if (!this.isView && !node?.getProp('isLock')) {
            const currentNodeDom = node ? Array.from(this.container.querySelectorAll('.x6-node')).filter((n) => {
                return n.getAttribute('data-cell-id') === node.id;
            })[0] : this.container;
            const ports = currentNodeDom?.querySelectorAll(
                '.x6-port-body',
            ) || [];
            for (let i = 0, len = ports.length; i < len; i += 1) {
                const portName = ports[i].getAttribute('port');
                if (source && source.includes('extend')) {
                    if (portName.includes('extend')) {
                        ports[i].style.visibility = visible ? 'visible' : 'hidden';
                    } else {
                        ports[i].style.visibility = 'hidden';
                    }
                } else if (source && portName.includes('extend')) {
                    ports[i].style.visibility = 'hidden';
                } else {
                    ports[i].style.visibility = visible ? 'visible' : 'hidden';
                }
            }
            if (visible && (!node || node.shape !== 'group')) {
                setTimeout(() => {
                    node.toFront();
                });
            }
        }
    };
    selectionChanged = (added, removed) => {
        this.filterErCell(added).forEach((cell) => {
            if (cell.isNode()) {
                cell.attr('body', {
                    stroke: 'red',
                    strokeWidth: 3,
                }, { ignoreHistory : true});
                cell.shape !== 'table' && this.changePortsVisible(false, cell);
            } else {
                cell.attr('line/stroke', this.currentColor.selected, { ignoreHistory : true});
                cell.attr('line/strokeWidth', 2, { ignoreHistory : true});
            }
        });
        this.filterErCell(removed).forEach((cell) => {
            if (cell.isNode()) {
                cell.attr('body', {
                    stroke: cell.shape === 'group' ? '#000000' : this.currentColor.border,
                    strokeWidth: 2,
                }, { ignoreHistory : true});
                if (cell.shape === 'edit-node-polygon' || cell.shape === 'edit-node-circle-svg' ||
                    cell.shape === 'edit-node' || cell.shape === 'edit-node-circle' || cell.shape === 'group') {
                    if (cell.shape === 'group') {
                        this.graph.batchUpdate('showChildren', () => {
                            const cells = getChildrenCell(cell, this.graph.getCells());
                            if (cells) {
                                cells.forEach((c) => {
                                    c.show({ ignoreHistory : true});
                                });
                            }
                        });
                    }
                    if (cell.shape === 'edit-node-polygon' || cell.shape === 'edit-node-circle-svg') {
                        this.graph.batchUpdate(() => {
                            cell.removeTools();
                            cell.setProp('label', cell.attr('text/text'), { ignoreHistory : true});
                            cell.attr('text/style/display', '', { ignoreHistory : true});
                            cell.attr('body', {
                                stroke: this.currentColor.border,
                                strokeWidth: 1,
                            }, { ignoreHistory : true});
                        });
                    }
                    cell.setProp('editable', false, { ignoreHistory : true, relation: true});
                }
            } else {
                cell.attr('line/stroke', cell.getProp('fillColor')
                    || this.currentColor.fillColor, { ignoreHistory : true});
                cell.attr('line/strokeWidth', 1, { ignoreHistory : true});
            }
        });

        // 分组和子节点需要互斥选中
        const addChildren = added
            .reduce((p, n) => p.concat(getChildrenCell(n, this.graph.getCells())), [])
            .map(n => n.id);
        added.filter(n => !addChildren.includes(n.id)).forEach((node) => {
            const childrenIds = getChildrenCell(node, this.graph.getCells()).map(n => n.id);
            const children = this.graph.getSelectedCells()
                .filter(c => childrenIds.includes(c.id));
            const parent = this.graph.getSelectedCells()
                .filter(c => getChildrenCell(c, this.graph.getCells()).map(n => n.id)
                    .includes(node.id));
            const unselectCells = children.concat(parent);
            if (unselectCells.length > 0) {
                this.graph.unselect(unselectCells);
            }
        });
    }
    edgeRemoved = (edge) => {
        if (this.isErCell(edge)) {
            const sourceCell = this.graph.getCell(edge.getSourceCellId());
            const targetCell = this.graph.getCell(edge.getTargetCellId());
            targetCell && targetCell.setProp('targetPort', Math.uuid(), { ignoreHistory : true});
            sourceCell && sourceCell.setProp('sourcePort', Math.uuid(), { ignoreHistory : true});
        }
    };
    edgeConnected = (args, dataSource) => {
        const edge = args.edge;
        if (this.isErCell(edge) && edge.getProp('isTemp')) {
            this.graph.batchUpdate('createEdge', () => {
                const node = this.graph.getCellById(edge.target.cell);
                const sourceNode = this.graph.getCellById(edge.source.cell);
                if (edge.target.port.includes('extend')) {
                    const nodeData = (dataSource.entities || [])
                        .filter(e => e.id === node.getProp('originKey'))[0] || node.data || {};
                    const primaryKeys = (nodeData.fields || []).filter(f => f.primaryKey);
                    if (primaryKeys.length === 0) {
                        this.graph.removeCell(edge);
                        Message.error({title: FormatMessage.string({id: 'canvas.node.extendError'})});
                    } else {
                        const targetField = primaryKeys[0];
                        const sourceField = (sourceNode?.data?.fields || [])
                            .filter(f => f.defKey === targetField.defKey)[0];
                        const createEdge = (creatField) => {
                            this.graph.addEdge({
                                shape: 'erdRelation',
                                relation: '1:n',
                                fillColor: node.getProp('fillColor') || this.currentColor.fillColor,
                                source: {
                                    cell: edge.target.cell,
                                    port: `${targetField.id}${separator}out`,
                                },
                                target: {
                                    cell: edge.source.cell,
                                    port: `${targetField.id}${separator}in`,
                                },
                            });
                            this.graph.removeCell(edge);
                            if (creatField) {
                                const sourceKey = sourceNode.getProp('originKey');
                                const newDataSource = {
                                    ...dataSource,
                                    entities: (dataSource.entities || []).map(((entity) => {
                                        if (entity.id === sourceKey) {
                                            const tempFields = entity.fields || [];
                                            return {
                                                ...entity,
                                                fields: [targetField].concat(tempFields),
                                            };
                                        }
                                        return entity;
                                    })),
                                };
                                this.updateDataSource && this.updateDataSource(newDataSource);
                            }
                        };
                        if (sourceField) {
                            // 判断两个字段之间是否已经存在连线
                            const allEdges = this.graph.getEdges();
                            const sourceFieldPort = [`${sourceField.id}${separator}in`, `${sourceField.id}${separator}out`];
                            const targetFieldPort = [`${targetField.id}${separator}in`, `${targetField.id}${separator}out`];
                            if (!allEdges.some((e) => {
                                if (e.source.cell === sourceNode.id && e.target.cell === node.id) {
                                    return sourceFieldPort.includes(e.source.port)
                                        && targetFieldPort.includes(e.target.port);
                                    // eslint-disable-next-line max-len
                                } else if (e.source.cell === node.id && e.target.cell === sourceNode.id) {
                                    return targetFieldPort.includes(e.source.port)
                                        && sourceFieldPort.includes(e.target.port);
                                }
                                return false;
                            })) {
                                // 创建连线
                                createEdge(false);
                            } else {
                                Message.warring({title: FormatMessage.string({id: 'canvas.node.extendWarring'})});
                                this.graph.removeCell(edge);
                            }
                        } else {
                            // 创建连线
                            createEdge(true);
                        }
                    }
                } else {
                    const fillColor = node.getProp('fillColor') || this.currentColor.fillColor;
                    const newEdge = edge.clone();
                    newEdge.setProp('isTemp', false);
                    newEdge.setProp('relation', node.shape === 'table' ? '1:n' : '0:concave');
                    newEdge.setProp('fillColor', fillColor);
                    newEdge.attr({
                        line: {
                            stroke: fillColor,
                            strokeDasharray: '',
                            sourceMarker: {
                                fillColor,
                                name: 'relation',
                                relation: node.shape === 'table' ? '1' : '0',
                            },
                            targetMarker: {
                                fillColor,
                                name: 'relation',
                                relation: node.shape === 'table' ? 'n' : 'concave',
                            },
                        },
                    });
                    this.graph.addEdge(newEdge);
                    this.graph.removeCell(edge);
                }
                const calcPorts = (port, calcNode) => {
                    const incomingEdges = this.graph.getIncomingEdges(calcNode) || [];
                    const outgoingEdges = this.graph.getOutgoingEdges(calcNode) || [];
                    const usedPorts = incomingEdges.map((e) => {
                        return e.getTargetPortId();
                    }).concat(outgoingEdges.map((e) => {
                        return e.getSourcePortId();
                    }));
                    const currentGroup = (/(\d+)/g).test(port) ? port.match(/[A-Za-z]+/g)[0] : port;
                    const currentGroupPorts = calcNode.getPorts()
                        .filter(p => p.group === currentGroup).map(p => p.id);
                    if (currentGroupPorts.length ===
                        [...new Set(usedPorts.filter(p => p.includes(currentGroup)))].length) {
                        calcNode.addPort({
                            id: `${currentGroup}${currentGroupPorts.length + 1}`, group: currentGroup,
                        });
                    }
                };
                if (node.shape === 'edit-node' || (this.relationType === 'entity' && node.shape === 'table')) {
                    // 判断输入锚点是否已经用完
                    calcPorts(edge.target.port, node);
                }
                if (sourceNode.shape === 'edit-node' || (this.relationType === 'entity' && node.shape === 'table')) {
                    // 判断输出锚点是否已经用完
                    calcPorts(edge.source.port, sourceNode);
                }
            });
        }
    };
    edgeChangeTarget = (cell) => {
        if (this.isErCell(cell.edge)) {
            const previous = this.graph.getCell(cell.previous.cell);
            const current = this.graph.getCell(cell.current.cell);
            previous?.setProp('targetPort', '', { ignoreHistory : true});
            current?.setProp('targetPort', cell.current.port, { ignoreHistory : true});
        }
    };
    edgeChangeSource = (cell) => {
        if (this.isErCell(cell.edge)) {
            const previous = this.graph.getCell(cell.previous.cell);
            const current = this.graph.getCell(cell.current.cell);
            previous?.setProp('sourcePort', '', { ignoreHistory : true});
            current?.setProp('sourcePort', cell.current.port, { ignoreHistory : true});
        }
    };
    edgeMouseup = (edge) => {
        if (this.isErCell(edge)) {
        const target = edge.getTargetCell();
        const source = edge.getSourceCell();
        target?.setProp('targetPort', '', { ignoreHistory : true});
        source?.setProp('sourcePort', '', { ignoreHistory : true});
        this.changePortsVisible(false);
        }
    }
    edgeAdded = (edge) => {
        if (this.isErCell(edge) && edge.getProp('isTemp')) {
            const source = edge.getSourceCell();
            source.setProp('sourcePort', edge.getSource().port, { ignoreHistory : true});
        }
    }
    nodeSelected = (node) => {
        if (this.isErCell(node)) {
            node.addTools([{
                name: 'showSizeTool',
            }]);
        }
    }
    edgeSelected = (edge) => {
        if (this.isErCell(edge)) {
            if (!edge.getProp('isLock')) {
                edge.addTools([
                    {
                        name: 'vertices',
                        args: {
                            attrs: {
                                stroke: this.currentColor.selected,
                                fill: this.currentColor.circleFill,
                                strokeWidth: 2,
                            },
                        },
                    },
                    {
                        name: 'target-arrowhead',
                        args: {
                            attrs: {
                                d: 'M 0, -5 a 5,5,0,1,1,0,10 a 5,5,0,1,1,0,-10',
                                fill: this.currentColor.selected,
                            },
                        },
                    },
                    {
                        name: 'source-arrowhead',
                        args: {
                            attrs: {
                                d: 'M 0, -5 a 5,5,0,1,1,0,10 a 5,5,0,1,1,0,-10',
                                fill: this.currentColor.selected,
                            },
                        },
                    },
                    // {
                    //     name: 'edgeTool',
                    //     args: {
                    //
                    //     },
                    // },
                ]);
            }
        }
    }
    delete = () => {
        const cells = this.graph.getSelectedCells();
        if (this.filterErCell(cells).length) {
            const deleteCells = cells.filter(c => !c.getProp('isLock'))
                .filter(c => !((c.shape === 'edit-node' ||
                    (c.shape === 'edit-node-circle-svg') || (c.shape === 'edit-node-polygon')
                    || c.shape === 'edit-node-circle' || c.shape === 'group') && (c.getProp('editable'))));
            deleteCells.forEach(c => c.removeTools());
            this.graph.removeCells(deleteCells);
        }
    }
    nodeAdded = (cell, options, dataSource) => {
        if (this.isErCell(cell)) {
            if (cell.shape === 'table') {
                if ((dataSource.entities || [])
                    .findIndex(e => cell.data.id === e.id) < 0){
                    this.updateDataSource && this.updateDataSource(this.addEntityData(cell, 'create', dataSource));
                }
            }
            if (cell.shape === 'group') {
                // setTimeout(() => {
                //     cell.toBack();
                // });
            }
            if (options.undo && cell.isNode()) {
                cell.attr('body', {
                    stroke: this.currentColor.border,
                }, { ignoreHistory : true});
            }
        }
    }
    nodeMouseEnter = (node, graph, id, isScroll) => {
        if (this.isErCell(node)) {
            if (!this.graph.isSelected(node) || node.shape === 'table') {
                this.changePortsVisible(true, node);
            }
            if (!isScroll && graph.isSelected(node)) {
                edgeNodeAddTool(node, graph, id, () => {
                    this.dataChange && this.dataChange(this.graph.toJSON({diff: true}));
                }, this.getDataSource, this.updateDataSource);
            }
        }
    };
    nodeMouseLeave = (node) => {
        if (this.isErCell(node)) {
            this.changePortsVisible(false, node);
        }
    };
    createEdge = () => {
        return new Shape.Edge({
            shape: 'erdRelation',
            isTemp: true, // 临时创建文件 无需在历史中存在
            attrs: {
                line: {
                    strokeDasharray: '5 5',
                    strokeWidth: 1,
                    stroke: this.currentColor.fillColor,
                },
            },
            router: {
                name: 'manhattan',
            },
        });
    };
    validateConnection = (targetPort, targetView, sourcePort,sourceCell) => {
        if (targetView) {
            const node = targetView.cell;
            this.changePortsVisible(true, node, sourcePort);
            if (sourcePort) {
                // 阻止自连
                if ((sourcePort === targetPort) && (sourceCell === node)) {
                    return false;
                }
            }
            if (sourcePort && sourcePort.includes('extend')) {
                return targetPort.includes('extend');
            }
            return !targetPort.includes('extend');
        }
        return true;
    };
    resizingEnabled = (node) => {
        return node.shape === 'edit-node' ||
            node.shape === 'edit-node-circle' ||
            node.shape === 'group' || node.shape === 'edit-node-polygon'
            || node.shape === 'edit-node-circle-svg';
    };
    preserveAspectRatio = (node) => {
        return node.shape === 'edit-node-circle-svg'
            || node.shape === 'edit-node-polygon';
    };
    interacting = ({cell}) => {
        if (this.isErCell(cell)) {
            return !((cell.shape === 'edit-node' || cell.shape === 'group'
                    || cell.shape === 'edit-node-circle'
                    || cell.shape === 'edit-node-polygon'
                    || cell.shape === 'edit-node-circle-svg')
                && cell.getProp('editable'));
        }
        return true;
    }
    onPortRendered = (args) => {
        const selectors = args.contentSelectors;
        const c = selectors && selectors.foContent;
        if (c) {
            ReactDOM.render(
              <div className={`${this.currentPrefix}-port`} />,
                c,
            );
        }
    }
    findParent = (node) => {
        const bbox = node.getBBox();
        return this.graph.getNodes().filter((n) => {
            const shape = n.shape;
            if (shape === 'group') {
                const targetBBox = n.getBBox();
                return bbox.isIntersectWithRect(targetBBox);
            }
            return false;
        });
    }
    cellClick = (cell, graph, id) => {
        if (this.isErCell(cell)) {
            edgeNodeAddTool(cell, graph, id, () => {
                this.dataChange && this.dataChange(this.graph.toJSON({diff: true}));
            }, this.getDataSource, this.updateDataSource);
        }
    };
    onScroll = () => {
        //this.graph.
    };
    nodeMoved = (cell, graph, id) => {
        if (this.isErCell(cell) && graph.isSelected(cell)) {
            edgeNodeAddTool(cell, graph, id, () => {
                this.dataChange && this.dataChange(this.graph.toJSON({diff: true}));
            }, this.getDataSource, this.updateDataSource);
        }
    };
    edgeMoved = (cell, graph, id) => {
        if (this.isErCell(cell) && graph.isSelected(cell)) {
            edgeNodeAddTool(cell, graph, id, () => {
                this.dataChange && this.dataChange(this.graph.toJSON({diff: true}));
            }, this.getDataSource, this.updateDataSource);
        }
    }
    nodeMouseOver = (node, e) => {
        if (node.shape === 'edit-node-polygon' || node.shape === 'edit-node-circle-svg') {
            if (e.target.tagName === 'image') {
                const preDom = document.getElementById(`image_${node.getProp('id')}`);
                if (preDom) {
                    document.body.removeChild(preDom);
                }
                const dom = document.createElement('div');
                dom.setAttribute('class', 'chiner-tooltip-container');
                dom.setAttribute('id', `image_${node.getProp('id')}`);
                dom.innerHTML = `<div class="chiner-tooltip-content " style="display: block;">
                   <div>${node.getProp('note')}</div>
                  <div class="chiner-tooltip-content-arrow-top"></div>
                  </div>`;
                document.body.appendChild(dom);
                const targetReact = e.target.getBoundingClientRect();
                dom.children[0].style.bottom = `${window.innerHeight - targetReact.top + 10}px`;
                dom.children[0].style.left = `${targetReact.left - dom.children[0].clientWidth / 2 + targetReact.width / 2}px`;
            } else {
                const dom = document.getElementById(`image_${node.getProp('id')}`);
                if (dom) {
                    document.body.removeChild(dom);
                }
            }
        }
    }
}
