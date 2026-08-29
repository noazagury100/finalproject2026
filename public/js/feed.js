document.addEventListener('DOMContentLoaded', () => {
    loadPostsViaAjax();
    loadGroupsViaAjax();
    setupCreatePostForm();
});


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


async function loadGroupsViaAjax() {
    try {
        const response = await fetch('/api/groups');
        if (!response.ok) return;

        const groups = await response.json();
        const container = document.getElementById('recommendedGroupsContainer');
        if (!container) return;

        if (groups.length === 0) {
            container.innerHTML = '<p style="font-size: 13px; color: #8e8e8e; margin-top: 8px;">אין קבוצות כרגע.</p>';
            return;
        }

        container.innerHTML = groups.map(g => `
            <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #efefef;">
                <strong style="font-size: 14px; color: #262626;">${g.name || 'קבוצת פיתוח'}</strong>
                <p style="font-size: 12px; color: #8e8e8e; margin: 2px 0;">${g.description || 'קבוצה ברשת'}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Groups Error:', error);
    }
}


function renderPosts(posts) {
    const feedContainer = document.getElementById('feedContainer');
    if (!feedContainer) return;

    if (posts.length === 0) {
        feedContainer.innerHTML = '<p style="text-align:center; color:#8e8e8e; margin-top:20px;">אין פוסטים להצגה כרגע.</p>';
        return;
    }

    feedContainer.innerHTML = '';

    posts.forEach(post => {
        const article = document.createElement('article');
        article.classList.add('post-card');

        const postDate = post.createdAt 
            ? new Date(post.createdAt).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' })
            : 'עכשיו';

        let mediaHTML = '';
        if (post.mediaType === 'image' && post.mediaUrl) {
            mediaHTML = `<div class="post-media"><img src="${post.mediaUrl}" alt="פוסט"></div>`;
        } else if (post.mediaType === 'video' && post.mediaUrl) {
            mediaHTML = `
                <div class="post-media">
                    <video controls width="100%">
                        <source src="${post.mediaUrl}" type="video/mp4">
                    </video>
                </div>`;
        }

        const commentsHTML = (post.comments || []).map(c => `
            <div style="font-size: 13px; margin-top: 4px;">
                <strong>${c.username || 'משתמש'}:</strong> ${c.text}
            </div>
        `).join('');

        article.innerHTML = `
            <div class="post-header">
                <div class="avatar-circle">${post.author ? post.author.username[0].toUpperCase() : 'U'}</div>
                <div>
                    <div class="username">${post.author ? post.author.username : 'משתמש'}</div>
                    <div style="font-size: 11px; color: #8e8e8e;">${postDate}</div>
                </div>
            </div>
            
            ${mediaHTML}

            <div class="post-body">
                <div class="post-caption"><p>${post.text || ''}</p></div>
                
                <div style="margin: 10px 0;">
                    <button class="like-btn" onclick="handleLike('${post._id}')">
                        ❤️ <span id="like-count-${post._id}">${post.likesCount || 0}</span> לייקים
                    </button>
                </div>

                <div class="comments-section" style="border-top: 1px solid #efefef; padding-top: 8px; margin-top: 10px;">
                    <div id="comments-list-${post._id}" style="margin-bottom: 8px;">
                        ${commentsHTML}
                    </div>
                    
                    <form onsubmit="handleComment(event, '${post._id}')" style="display: flex; gap: 5px;">
                        <input type="text" id="comment-input-${post._id}" placeholder="הוסף תגובה..." style="flex:1; padding: 6px; font-size: 13px; border: 1px solid #dbdbdb; border-radius: 4px;">
                        <button type="submit" style="background: #0095f6; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 13px; cursor: pointer;">שלח</button>
                    </form>
                </div>
            </div>
        `;

        feedContainer.appendChild(article);
    });
}


async function handleLike(postId) {
    try {
        const response = await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
        if (!response.ok) throw new Error('שגיאה בלייק');

        const data = await response.json();
        const countElement = document.getElementById(`like-count-${postId}`);
        if (countElement) countElement.innerText = data.likesCount;
    } catch (error) {
        console.error('Like Error:', error);
    }
}


async function handleComment(event, postId) {
    event.preventDefault();
    const input = document.getElementById(`comment-input-${postId}`);
    const commentText = input ? input.value.trim() : '';

    if (!commentText) {
        alert('אנא הוסף תוכן לתגובה לפני השליחה.');
        return;
    }

    try {
        const response = await fetch(`/api/posts/${postId}/comment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: commentText })
        });

        if (!response.ok) throw new Error('שגיאה בתגובה');

        input.value = '';
        await loadPostsViaAjax();
    } catch (error) {
        console.error('Comment Error:', error);
    }
}


function setupCreatePostForm() {
    const createPostForm = document.getElementById('createPostForm');
    if (!createPostForm) return;

    createPostForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const text = document.getElementById('postCaptionInput')?.value.trim() || '';
        const mediaUrl = document.getElementById('postUrlInput')?.value.trim() || '';
        const mediaType = document.getElementById('postTypeInput')?.value || 'text';

        if (!text && !mediaUrl) {
            alert('יש להזין טקסט או קישור לתמונה/וידאו לפחות.');
            return;
        }

        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, mediaUrl, mediaType })
            });

            if (!response.ok) throw new Error('שגיאה ביצירת פוסט');

            await loadPostsViaAjax();
            createPostForm.reset();
        } catch (error) {
            console.error('Create Post Error:', error);
        }
    });
}