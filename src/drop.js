import uniqBy from 'lodash.uniqby';

const filterOverlappingDrop = (xScale, dropDate) => d =>
    uniqBy(d.data, data => Math.round(xScale(dropDate(data))));

export default (config, xScale) => selection => {
    const {
        drop: {
            type: dropType,
            color: dropColor,
            radius: dropRadius,
            date: dropDate,
            onClick,
            onMouseOver,
            onMouseOut,
        },
    } = config;

    const drops = selection
        .selectAll('.drop')
        .data(filterOverlappingDrop(xScale, dropDate));

    switch (dropType) {
        case 'rect':
            drops
                .enter()
                .append('rect')
                .classed('drop', true)
                .on('click', onClick)
                .on('mouseover', onMouseOver)
                .on('mouseout', onMouseOut)
                .merge(drops)
                .attr('height', dropRadius)
                .attr('width', d => {
                    const sumWidth = Math.max(
                        xScale(d.endDate) - xScale(d.startDate),
                        1
                    );
                    const endTimestamp = d.endDate.getTime();
                    const startTimestamp = d.startDate.getTime();
                    const rectCount = Math.max(
                        (endTimestamp - startTimestamp) / 1000,
                        1
                    );
                    const singleWidth = sumWidth / rectCount;
                    return sumWidth + singleWidth;
                })
                .attr('fill', dropColor)
                .attr('x', d => {
                    const originalPoint = xScale(dropDate(d));
                    const sumWidth = Math.max(
                        xScale(d.endDate) - xScale(d.startDate),
                        1
                    );
                    const endTimestamp = d.endDate.getTime();
                    const startTimestamp = d.startDate.getTime();
                    let rectCount = Math.max(
                        (endTimestamp - startTimestamp) / 1000,
                        1
                    );
                    rectCount = rectCount > 0 ? rectCount : 1;
                    const singleWidth = sumWidth / rectCount;
                    return originalPoint - singleWidth / 2;
                })
                .attr('y', -(dropRadius / 2));
            break;
        default:
            drops
                .enter()
                .append('circle')
                .classed('drop', true)
                .on('click', onClick)
                .on('mouseover', onMouseOver)
                .on('mouseout', onMouseOut)
                .merge(drops)
                .attr('r', dropRadius)
                .attr('fill', dropColor)
                .attr('cx', d => xScale(dropDate(d)));
            break;
    }

    drops
        .exit()
        .on('click', null)
        .on('mouseover', null)
        .on('mouseout', null)
        .remove();
};
