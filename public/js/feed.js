// טעינת הפוסטים והגדרת האירועים בטעינת הדף
document.addEventListener('DOMContentLoaded', () => {
    loadPostsViaAjax();
    setupCreatePostForm();
});

// שליפת פוסטים מהשרת ב-AJAX
async function loadPostsViaAjax() {
    try {
        const response = await fetch('/api/posts');
        if (!response.ok) throw new Error('שגיאה בטעינת הפוסטים');

        const posts = await response.json();
        renderPosts(posts);
    } catch (error) {
        console.error('AJAX Error:', error);
    }
}

// הצגת הפוסטים בפיד באופן דינמי
function renderPosts(posts) {
    const feedContainer = document.querySelector('.feed-section');
    if (!feedContainer) return;

    if (posts.length === 0) {
        feedContainer.innerHTML = '<p style="text-align:center;">אין פוסטים להצגה כרגע.</p>';
        return;
    }

    feedContainer.innerHTML = '';

    // תמונת אווטאר ברירת מחדל ב-SVG מקומי למניעת שגיאות רשת ותמונות שבורות
    const defaultAvatar = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="%23ccc"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>';

    posts.forEach(post => {
        const article = document.createElement('article');
        article.classList.add('post');

        let mediaHTML = '';
        if (post.mediaType === 'image' && post.mediaUrl) {
            mediaHTML = `<img src="${post.mediaUrl}" alt="פוסט" style="width:100%;" onerror="this.style.display='none'">`;
        } else if (post.mediaType === 'video' && post.mediaUrl) {
            mediaHTML = `
                <video controls width="100%">
                    <source src="${post.mediaUrl}" type="video/mp4">
                    הדפדפן שלך לא תומך בוידאו.
                </video>`;
        }

        article.innerHTML = `
            <header class="post-header" style="display:flex; align-items:center; gap:10px; padding:10px;">
                <img src="${defaultAvatar}" alt="פרופיל" class="avatar" style="width:40px; height:40px; border-radius:50%;">
                <span class="username" style="font-weight:bold;">${post.author ? post.author.username : 'משתמש'}</span>
            </header>
            <div class="post-caption" style="padding: 10px 15px;">
                <p>${post.text || ''}</p>
            </div>
            <div class="post-media">${mediaHTML}</div>
            <div class="post-actions" style="padding:10px;">
                <button class="btn-like">❤️ לייק</button>
            </div>
        `;

        feedContainer.appendChild(article);
    });
}

// טיפול בשליחת טופס יצירת פוסט ב-AJAX
function setupCreatePostForm() {
    const createPostForm = document.getElementById('createPostForm');
    if (!createPostForm) return;

    createPostForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const textInput = document.getElementById('postText');
        const mediaUrlInput = document.getElementById('postMediaUrl');
        const mediaTypeSelect = document.getElementById('postMediaType');

        const postData = {
            text: textInput ? textInput.value : '',
            mediaUrl: mediaUrlInput ? mediaUrlInput.value : '',
            mediaType: mediaTypeSelect ? mediaTypeSelect.value : 'text'
        };

        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData)
            });

            if (response.ok) {
                await loadPostsViaAjax(); // רענון הפיד בלייב אחרי הוספה
                createPostForm.reset();   // ניקוי השדות בטופס
            } else {
                alert('שגיאה בהעלאת הפוסט');
            }
        } catch (error) {
            console.error('AJAX Post Error:', error);
        }
    });
}