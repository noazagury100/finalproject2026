document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('/api/stats/posts-by-type');
        const data = await res.json();

        if (!data || data.length === 0) {
            document.getElementById('media-type-chart').innerHTML = '<p>אין מספיק נתונים להצגת גרף</p>';
            return;
        }

        renderPieChart(data);
    } catch (err) {
        console.error('Error loading stats chart:', err);
    }
});

function renderPieChart(data) {
    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    const container = d3.select('#media-type-chart');
    container.selectAll('*').remove();

    const svg = container
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.mediaType))
        .range(['#0095f6', '#ed4956', '#ffc107', '#28a745']);

    const pie = d3.pie()
        .value(d => d.count);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius - 20);

    const arcs = svg.selectAll('arc')
        .data(pie(data))
        .enter()
        .append('g');

    arcs.append('path')
        .attr('d', arc)
        .attr('fill', d => color(d.data.mediaType));

    arcs.append('text')
        .attr('transform', d => `translate(${arc.centroid(d)})`)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', '#fff')
        .style('font-weight', 'bold')
        .text(d => `${d.data.mediaType}: ${d.data.count}`);
}