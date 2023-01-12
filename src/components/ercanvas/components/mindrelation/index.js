import { Graph, Path } from '@antv/x6';

// 连接器
Graph.registerConnector(
    'mindmap',
    (sourcePoint, targetPoint, routerPoints, options, edgeView) => {
        const anchor = edgeView.cell.prop('source/anchor/name');
        // eslint-disable-next-line no-nested-ternary
        const midX = sourcePoint.x + (anchor ? (anchor === 'left' ? -10 : 10) : 0);
        const midY = sourcePoint.y;
        const ctrX = (targetPoint.x - midX) / 5 + midX;
        const ctrY = targetPoint.y;
        const pathData = `
     M ${sourcePoint.x} ${sourcePoint.y}
     L ${midX} ${midY}
     Q ${ctrX} ${ctrY} ${targetPoint.x} ${targetPoint.y}
    `;
        return options.raw ? Path.parse(pathData) : pathData;
    },
    true,
);


Graph.registerEdge('mind-edge', {
    inherit: 'edge',
    connector: {
        name: 'mindmap',
    },
    attrs: {
        line: {
            targetMarker: '',
            strokeWidth: 1,
            stroke: '#ACDAFC',
        },
    },
    zIndex: 0,
});
