document.addEventListener("DOMContentLoaded", () => {
    loadMediaTypeStats();
});

function loadMediaTypeStats() {
    fetch('/api/stats/posts-by-type')
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            console.log("Raw API Response from MongoDB:", data);
            
            if (!data || data.length === 0) {
                d3.select("#media-type-chart").html("<p style='color: #666;'>אין מספיק נתונים להצגת הגרף</p>");
                return;
            }

            // מיפוי מדויק של התוצאות מהשרת
            const formattedData = data.map(item => ({
                label: item._id === 'image' ? 'תמונה' : item._id === 'video' ? 'וידאו' : (item._id || 'טקסט'),
                count: item.totalPosts || item.count || item.total || 0
            }));

            renderMediaTypeChart(formattedData);
        })
        .catch(err => {
            console.error("Failed to fetch real stats:", err);
            d3.select("#media-type-chart").html("<p style='color: red;'>שגיאה בחיבור ל-API של הסטטיסטיקות</p>");
        });
}

function renderMediaTypeChart(data) {
    const width = 320;
    const height = 320;
    const radius = Math.min(width, height) / 2;

    d3.select("#media-type-chart").html("");

    const svg = d3.select("#media-type-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.label))
        .range(["#0095f6", "#fcaf45", "#e1306c", "#8e8e8e"]);

    const pie = d3.pie()
        .value(d => d.count)
        .sort(null);

    const arc = d3.arc()
        .innerRadius(65)
        .outerRadius(radius - 15);

    const arcs = svg.selectAll("g.arc")
        .data(pie(data))
        .enter()
        .append("g")
        .attr("class", "arc");

    arcs.append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.label))
        .attr("stroke", "#ffffff")
        .style("stroke-width", "3px");

    arcs.append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("text-anchor", "middle")
        .style("font-size", "13px")
        .style("font-weight", "bold")
        .style("fill", "#ffffff")
        .text(d => d.data.count > 0 ? `${d.data.label} (${d.data.count})` : '');
}