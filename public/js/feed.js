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

    posts.forEach(post => {
        const article = document.createElement('article');
        article.classList.add('post');

        let mediaHTML = '';
        if (post.mediaType === 'image' && post.mediaUrl) {
            mediaHTML = `<img src="${post.mediaUrl}" alt="פוסט" style="width:100%;">`;
        } else if (post.mediaType === 'video' && post.mediaUrl) {
            mediaHTML = `
                <video controls width="100%">
                    <source src="${post.mediaUrl}" type="video/mp4">
                    הדפדפן שלך לא תומך בוידאו.
                </video>`;
        }

        article.innerHTML = `
            <header class="post-header">
                <img src="https://via.placeholder.com/40" alt="פרופיל" class="avatar">
                <span class="username">${post.author ? post.author.username : 'משתמש'}</span>
            </header>
            <div class="post-caption" style="padding: 10px 15px;">
                <p>${post.text || ''}</p>
            </div>
            <div class="post-media">${mediaHTML}</div>
            <div class="post-actions">
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