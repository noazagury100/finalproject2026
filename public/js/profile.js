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
    // הגדלת המרווח השמאלי ל-50 כדי שיהיה מקום למספרים
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = 360 - margin.left - margin.right;
    const height = 220 - margin.top - margin.bottom;

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
        .padding(0.25);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.likes) || 50])
        .range([height, 0]);

    // ציר X
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    // ציר Y - רווחים נקיים בין המספרים
    svg.append("g")
        .call(d3.axisLeft(y).ticks(5));

    // העמודות
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
        .attr("rx", 6);
}