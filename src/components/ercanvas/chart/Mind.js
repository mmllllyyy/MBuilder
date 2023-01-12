import Hierarchy from '@antv/hierarchy';
import {FormatMessage} from 'components';
import { tree2array } from '../../../lib/tree';
import { createContentMenu } from '../components/util';

export default class Mind {
    count = 1;
    constructor({graph, dnd}) {
        this.graph = graph;
        this.dnd = dnd;
    }
    filterMindCell = (cells) => {
        // 分支主题 中心主题 连接线
        const erCells =
            ['mind-topic-branch', 'mind-topic', 'mind-edge'];
        return ([].concat(cells)).filter((c) => {
            return erCells.includes(c.shape);
        });
    }
    isMindCell = (cell) => {
        return this.filterMindCell(cell).length > 0;
    }
    getChildrenCell = (n, cells) => {
        if (n.prop('children')?.length > 0) {
            return n.prop('children').reduce((a, b) => {
                const child = cells.filter(c => c.id === b)[0];
                if (child) {
                    return a.concat(child).concat(this.getChildrenCell(child, cells));
                }
                return a;
            }, []);
        }
        return [];
    };
    updateTree = (node) => {
        const nodes = this.graph.getNodes();
        const getChildrenId = (n) => {
            const children = n.prop('children') || [];
            if (children.length === 0) {
                return [];
            }
            return children.reduce((a, b) => {
                const bNode = nodes.filter(cNode => cNode.id === b)[0];
                return a.concat(bNode ? getChildrenId(bNode) : []);
            }, children);
        };
        const node2Tree = (root) => {
            const getChildrenNode = (children) => {
                return children.map((c) => {
                    const cNode = nodes.filter(n => n.id === c)[0];
                    if (!cNode) {
                        return null;
                    }
                    return {
                        id: cNode.id,
                        ...cNode.size(),
                        children: getChildrenNode(cNode.prop('children') || []),
                    };
                }).filter(c => !!c);
            };
            return {
                id: root.id,
                ...root.size(),
                children: getChildrenNode(root.prop('children') || []),
            };
        };
        let root;
        // 获取根节点位置
        if (node.shape === 'mind-topic') {
            root = node;
        } else {
            root = nodes.filter(n => n.shape === 'mind-topic')
                .filter(n => getChildrenId(n).includes(node.id))[0];
        }
        // 生成新的节点树
        return Hierarchy.mindmap(
            node2Tree(root),
            {
                direction: 'H',
                getHeight(d) {
                    return d.height;
                },
                getWidth(d) {
                    return d.width;
                },
                getHGap() {
                    return 40;
                },
                getVGap() {
                    return 20;
                },
            });
    };
    addChildNode = (node) => {
        // 创建临时节点
        const newNode = {
            id: Math.uuid(),
            width: 60,
            height: 40,
        };
        this.graph.batchUpdate('addChildNode', () => {
            // 增加子节点
            this.graph.addNode({
                zIndex: 3,
                id: newNode.id,
                shape: 'mind-topic-branch',
                width: newNode.width,
                height: newNode.height,
                label: `分支主题${this.count}`,
                visible: true,
                expand: (n) => {
                    this.graph.batchUpdate('expand', () => {
                        const currentExpand = !n.prop('isExpand');
                        const children = this.getChildrenCell(n, this.graph.getNodes());
                        children.forEach((c) => {
                            currentExpand ? c.show() : c.hide();
                        });
                        n.prop('isExpand', currentExpand);
                    });
                },
                isExpand: true,
            });
            // 增加连接线
            this.graph.addEdge({
                id: Math.uuid(),
                shape: 'mind-edge',
                source: {
                    cell: node.id,
                },
                target: {
                    cell: newNode.id,
                },
            });
            this.count += 1;
            // 更新当前界节点的子节点数据
            node.prop('children', (node.prop('children') || []).concat(newNode.id));
            // 重新生成新的布局
            const result = tree2array([this.updateTree(node)]);
            // 更新整个树
            const nodes = this.graph.getNodes();
            // 计算坐标差
            const currentNode = result.filter(n => n.id === node.id)[0];
            const prePosition = node.position();
            const offset = {x: currentNode.x - prePosition.x, y: currentNode.y - prePosition.y};
            // 所有连接线;
            const edges = this.graph.getEdges();
            const mindEdge = edges.filter(n => n.shape === 'mind-edge');
            result.forEach((n) => {
                const updateNode = nodes.filter(c => c.id === n.id)[0];
                // 更新节点信息
                updateNode?.position(n.x - offset.x, n.y - offset.y);
                updateNode?.prop('data/side', n.side);
                updateNode?.toFront();
            });
            mindEdge.forEach((e) => {
                // 更新连线信息
                const source = e.getSourceCell();
                const target = e.getTargetCell();
                if (source) {
                    e.prop('source/anchor/name', source.prop('data/side'));
                }
                if (target) {
                    e.prop('target/anchor/name', target.prop('data/side') === 'left' ? 'right' : 'left');
                }
            });
            setTimeout(() => {
                node.toFront();
            });
        });
    };
    createTopicNode = (e, isRoot) => {
        if (isRoot) {
            const node =  this.graph.createNode({
                shape: 'mind-topic',
                label: '中心主题',
                width: 160,
                height: 50,
            });
            this.dnd.start(node, e.nativeEvent);
        } else {
            const selectedNodes = this.graph.getSelectedCells()
                .filter(item => item.isNode() && item.prop('shape').includes('mind'));
            if (selectedNodes.length) {
                const node = selectedNodes[0];
                this.addChildNode(node);
            }
        }
    }
    selectionChanged = (added, removed) => {
        this.filterMindCell(added).forEach((c) => {
            if (c.isNode()) {
                c.attr('body', {
                    stroke: 'red',
                    strokeWidth: 3,
                }, { ignoreHistory : true});
            } else {
                c.attr('line/strokeWidth', 2, { ignoreHistory : true});
            }
        });
        this.filterMindCell(removed).forEach((c) => {
            if (c.isNode()) {
                c.attr('body', {
                    stroke: '#5F95FF',
                    strokeWidth: 1,
                }, { ignoreHistory : true});
            } else {
                c.attr('line/strokeWidth', 1, { ignoreHistory : true});
            }
        });
    }
    interacting = ({cell}) => {
        if (this.isMindCell(cell)) {
            return cell.shape === 'mind-topic' && !cell.getProp('editable');
        }
        return true;
    }
    nodeContextmenu = (e, cell) => {
        if (this.isMindCell(cell)) {
            createContentMenu(e, [
                {name: FormatMessage.string({id: 'canvas.node.link'})},
            ], () => {

            });
            console.log('===');
        }
    }
    render = (cells) => {
        return cells;
    }
}
