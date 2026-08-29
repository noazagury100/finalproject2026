document.addEventListener('DOMContentLoaded', () => {
    // 1. אתחול המפה ומרכוז על ישראל
    const map = L.map('map').setView([31.7683, 35.2137], 8);

    // 2. טעינת שכבת המפה מ-OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // 3. משיכת הקבוצות מהשרת והצגת סמנים על המפה
    fetch('/api/groups/locations')
        .then(res => res.json())
        .then(groups => {
            if (Array.isArray(groups)) {
                groups.forEach(group => {
                    // בדיקה אם יש קואורדינטות לקבוצה (ברירת מחדל אם חסר)
                    const lat = group.lat || 32.0853;
                    const lng = group.lng || 34.7818;

                    // הוספת סמן (Marker) לכל קבוצה
                    const marker = L.marker([lat, lng]).addTo(map);
                    
                    // חלונית מידע בלחיצה על הסמן
                    marker.bindPopup(`
                        <div style="text-align: right; dir: rtl;">
                            <h3>${group.name}</h3>
                            <p>${group.description || 'ללא תיאור'}</p>
                        </div>
                    `);
                });
            }
        })
        .catch(err => console.error('Error fetching group locations:', err));
});