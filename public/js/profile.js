document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/stats')
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) {
                renderChart(data);
            }
        })
        .catch(err => console.error('Error loading stats:', err));
});

function renderChart(data) {
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 320 - margin.left - margin.right;
    const height = 220 - margin.top - margin.bottom;

    // ניקוי קודם אם היה
    d3.select("#d3-chart").html("");

    const svg = d3.select("#d3-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
        .domain(data.map(d => d.day))
        .range([0, width])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.likes) || 50])
        .range([height, 0]);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));

    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.day))
        .attr("width", x.bandwidth())
        .attr("y", d => y(d.likes))
        .attr("height", d => height - y(d.likes))
        .attr("fill", "#0095f6")
        .attr("rx", 4);
}