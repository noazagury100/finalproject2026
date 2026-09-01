document.addEventListener('DOMContentLoaded', async () => {
    await loadUserProfile();
    await renderStatsChart();
});

async function loadUserProfile() {
    try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
            window.location.href = '/login';
            return;
        }

        const user = await res.json();
        
        const usernameEl = document.getElementById('profileUsername');
        const userAvatarEl = document.getElementById('userAvatar');
        
        if (usernameEl && user.username) {
            usernameEl.innerText = user.username;
        }
        if (userAvatarEl && user.username) {
            userAvatarEl.innerText = user.username[0].toUpperCase();
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

async function renderStatsChart() {
    const svgElement = document.getElementById('likesChart');
    if (!svgElement) return;

    let data = [];
    try {
        const res = await fetch('/api/stats');
        data = await res.json();
    } catch (err) {
        console.error(err);
    }

    if (!data || data.length === 0) return;

    const width = 500;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    const svg = d3.select('#likesChart')
        .attr('width', width)
        .attr('height', height);

    svg.selectAll('*').remove();

    const maxVal = d3.max(data, d => d.count || d.likes || 0) || 5;

    const x = d3.scaleBand()
        .domain(data.map(d => d.day))
        .range([margin.left, width - margin.right])
        .padding(0.3);

    const y = d3.scaleLinear()
        .domain([0, maxVal]).nice()
        .range([height - margin.bottom, margin.top]);

    svg.append('g')
        .selectAll('rect')
        .data(data)
        .join('rect')
        .attr('x', d => x(d.day))
        .attr('y', d => y(d.count || d.likes || 0))
        .attr('height', d => y(0) - y(d.count || d.likes || 0))
        .attr('width', x.bandwidth())
        .attr('fill', '#0095f6')
        .attr('rx', 4);

    svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));

    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(Math.min(maxVal, 5)));
}