let map;
let markers = [];
let allGroups = [];
let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
    await fetchCurrentUser();
    initMap();
    loadGroups();

    const groupForm = document.getElementById('groupForm');
    if (groupForm) {
        groupForm.addEventListener('submit', handleSaveGroup);
    }
});

async function fetchCurrentUser() {
    try {
        const res = await fetch('/api/auth/me');
        if (res.ok) currentUser = await res.json();
    } catch (err) {
        console.error(err);
    }
}

function initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;
    map = L.map('map').setView([32.0853, 34.7818], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);
}

async function loadGroups() {
    try {
        const res = await fetch('/api/groups');
        allGroups = await res.json();
        renderGroups(allGroups);
        await updateMapMarkers(allGroups);
    } catch (err) {
        console.error('שגיאה בטעינת הקבוצות:', err);
    }
}

function renderGroups(groups) {
    const container = document.getElementById('groupsContainer');
    if (!container) return;

    if (!groups || groups.length === 0) {
        container.innerHTML = '<p style="color: #8e8e8e; padding: 10px;">לא נמצאו קבוצות התואמות את החיפוש.</p>';
        return;
    }

    container.innerHTML = groups.map(g => {
        const isOwner = currentUser && (g.creator === currentUser.username || (g.creatorId && g.creatorId === currentUser.id));
        const isMember = currentUser && g.members.some(m => (m._id || m) === currentUser.id);

        const membersHtml = (g.members && g.members.length > 0) 
            ? g.members.map(m => {
                const uName = typeof m === 'object' ? m.username : 'משתמש';
                const mId = typeof m === 'object' ? m._id : m;
                return `
                    <span style="display: inline-block; background: #e9ecef; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin: 2px;">
                        ${uName}${isOwner && mId !== currentUser.id ? `<b onclick="removeMember('${g._id}', '${mId}')" style="color: red; cursor: pointer; margin-right: 4px;">✕</b>` : ''}
                    </span>
                `;
            }).join('') 
            : 'אין חברים עדיין';

        const escapedName = g.name.replace(/'/g, "\\'").replace(/"/g, "&quot;");
        const escapedDesc = g.description.replace(/'/g, "\\'").replace(/"/g, "&quot;");
        const escapedAddress = (g.address || 'תל אביב').replace(/'/g, "\\'").replace(/"/g, "&quot;");

        return `
            <div style="border: 1px solid #dbdbdb; border-radius: 8px; padding: 15px; background: #fff; margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4 style="margin: 0 0 5px 0;">${g.name}</h4>
                        <p style="margin: 0; color: #666; font-size: 14px;">${g.description}</p>
                        <small style="color: #0095f6; font-weight: bold;">📍 כתובת: ${g.address || 'תל אביב'}</small><br>
                        <small style="color: #999;">מנהל: ${g.creator || 'מנהל'}</small>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        ${isOwner ? `
                            <button onclick="editGroup('${g._id}', '${escapedName}', '${escapedDesc}', '${escapedAddress}')" style="background: #ffc107; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;">ערוך</button>
                            <button onclick="deleteGroup('${g._id}')" style="background: #ed4956; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;">מחק</button>
                        ` : `
                            <button onclick="toggleJoinGroup('${g._id}')" style="background: ${isMember ? '#ed4956' : '#0095f6'}; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;">
                                ${isMember ? 'צא מהקבוצה' : 'הצטרף לקבוצה'}
                            </button>
                        `}
                    </div>
                </div>
                <div style="margin-top: 10px; background: #f8f9fa; padding: 6px 10px; border-radius: 4px; font-size: 13px;">
                    <strong>חברים בקבוצה:</strong> ${membersHtml}
                </div>
            </div>
        `;
    }).join('');
}

// המרת כתובות לסמנים במפה (Geocoding)
async function updateMapMarkers(groups) {
    if (!map) return;
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    for (const g of groups) {
        const address = g.address || 'תל אביב';
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
            const data = await res.json();
            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);
                const marker = L.marker([lat, lon]).addTo(map).bindPopup(`<b>${g.name}</b><br>📍 ${address}<br>${g.description}`);
                markers.push(marker);
            }
        } catch (err) {
            console.error('Error fetching coords for address:', address, err);
        }
    }
}

async function handleSaveGroup(e) {
    e.preventDefault();
    const groupId = document.getElementById('groupId').value;
    const name = document.getElementById('groupName').value;
    const description = document.getElementById('groupDesc').value;
    const address = document.getElementById('groupAddress').value || 'תל אביב';

    const method = groupId ? 'PUT' : 'POST';
    const url = groupId ? `/api/groups/${groupId}` : '/api/groups';

    const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, address })
    });

    if (res.ok) {
        resetForm();
        loadGroups();
    } else {
        alert('שגיאה בשמירת הקבוצה');
    }
}

function editGroup(id, name, desc, address) {
    document.getElementById('groupId').value = id;
    document.getElementById('groupName').value = name;
    document.getElementById('groupDesc').value = desc;
    if (document.getElementById('groupAddress')) {
        document.getElementById('groupAddress').value = address;
    }
    document.getElementById('formTitle').innerText = '✏️ עריכת שם, תיאור וכתובת הקבוצה';
    document.getElementById('submitGroupBtn').innerText = 'עדכן קבוצה';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
    document.getElementById('groupId').value = '';
    document.getElementById('groupName').value = '';
    document.getElementById('groupDesc').value = '';
    if (document.getElementById('groupAddress')) {
        document.getElementById('groupAddress').value = '';
    }
    document.getElementById('formTitle').innerText = '➕ יצירת קבוצה חדשה';
    document.getElementById('submitGroupBtn').innerText = 'צור קבוצה';
}

async function deleteGroup(id) {
    if (!confirm('האם למחוק קבוצה זו?')) return;
    const res = await fetch(`/api/groups/${id}`, { method: 'DELETE' });
    if (res.ok) loadGroups();
}

async function toggleJoinGroup(id) {
    const res = await fetch(`/api/groups/${id}/toggle-join`, { method: 'POST' });
    if (res.ok) loadGroups();
}

async function removeMember(groupId, memberId) {
    if (!confirm('האם להסיר חבר זה מהקבוצה?')) return;
    const res = await fetch(`/api/groups/${groupId}/remove-member`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId })
    });
    if (res.ok) loadGroups();
}

window.filterGroups = function() {
    const searchInput = document.getElementById('searchGroupInput');
    if (!searchInput) return;

    const query = searchInput.value.toLowerCase().trim();
    const filtered = allGroups.filter(g => 
        (g.name && g.name.toLowerCase().includes(query)) || 
        (g.description && g.description.toLowerCase().includes(query)) ||
        (g.address && g.address.toLowerCase().includes(query))
    );

    renderGroups(filtered);
    updateMapMarkers(filtered);
};