document.addEventListener('DOMContentLoaded', () => {
    loadPostsViaAjax();
    loadGroupsViaAjax();

    const createForm = document.getElementById('createPostForm');
    if (createForm) {
        createForm.addEventListener('submit', handleCreatePost);
    }
});

const CURRENT_USER = 'avi_cohen';

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
        const groupsContainer = document.querySelector('.groups-list');

        if (groupsContainer && groups.length > 0) {
            groupsContainer.innerHTML = groups.map(g => `
                <li style="padding: 8px 0; border-bottom: 1px solid #efefef;">👥 <strong>${g.name}</strong></li>
            `).join('');
        }
    } catch (error) {
        console.error('Groups Fetch Error:', error);
    }
}

function renderPosts(posts) {
    const feedContainer = document.getElementById('feedContainer');
    if (!feedContainer) return;

    if (!posts || posts.length === 0) {
        feedContainer.innerHTML = '<p style="text-align:center; color:#8e8e8e; padding: 20px;">אין פוסטים להצגה כרגע.</p>';
        return;
    }

    feedContainer.innerHTML = '';

    posts.forEach(post => {
        const postElement = document.createElement('article');
        postElement.classList.add('post-card');

        const authorName = post.author && post.author.username ? post.author.username : 'avi_cohen';
        const initial = authorName.charAt(0).toUpperCase();

        const postDate = new Date(post.createdAt || Date.now()).toLocaleString('he-IL', {
            dateStyle: 'short',
            timeStyle: 'short'
        });

        // הצגת כפתור מחיקה רק אם הפוסט שייך למשתמש המחובר
        let deleteButtonHTML = '';
        if (authorName === CURRENT_USER) {
            deleteButtonHTML = `
                <button onclick="handleDeletePost('${post._id}')" style="background: none; border: none; color: #ed4956; cursor: pointer; font-size: 13px; font-weight: 600;">🗑️ מחק פוסט</button>
            `;
        }

        let mediaHTML = '';
        if (post.mediaType === 'video' && post.mediaUrl) {
            mediaHTML = `
                <div class="post-media">
                    <video controls style="width: 100%; max-height: 450px; display: block;">
                        <source src="${post.mediaUrl}" type="video/mp4">
                    </video>
                </div>`;
        } else if (post.mediaType === 'image' && post.mediaUrl) {
            mediaHTML = `
                <div class="post-media">
                    <img src="${post.mediaUrl}" alt="Post Image" style="width: 100%; max-height: 450px; object-fit: cover; display: block;">
                </div>`;
        }

        const commentsHTML = (post.comments || []).map(c => `
            <p style="font-size: 13px; margin: 4px 0;">
                <strong>${c.username || 'avi_cohen'}:</strong> ${c.text}
            </p>
        `).join('');

        postElement.innerHTML = `
            <header class="post-header" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div class="avatar-circle" style="width: 36px; height: 36px; background-color: #0095f6; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">${initial}</div>
                    <div>
                        <span class="username" style="font-weight: 600; font-size: 14px; display: block;">${authorName}</span>
                        <span class="post-time" style="font-size: 11px; color: #8e8e8e;">${postDate}</span>
                    </div>
                </div>
                ${deleteButtonHTML}
            </header>

            ${mediaHTML}

            <div class="post-body" style="padding: 12px 16px;">
                <p class="post-caption" style="font-size: 14px; margin-bottom: 8px;"><strong>${authorName}</strong> ${post.text || ''}</p>
                
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                    <button onclick="handleLike('${post._id}')" class="like-btn" style="background: none; border: none; cursor: pointer; font-size: 16px;">❤️ לייק</button>
                    <span style="font-size: 13px; font-weight: 600;" id="likes-count-${post._id}">${post.likesCount || 0} לייקים</span>
                </div>

                <div class="comments-section" style="border-top: 1px solid #efefef; padding-top: 8px; margin-top: 8px;">
                    <div class="comments-list">${commentsHTML}</div>
                    <form onsubmit="handleComment(event, '${post._id}')" style="display: flex; gap: 6px; margin-top: 8px;">
                        <input type="text" placeholder="הוסף תגובה..." required style="flex: 1; padding: 6px; border: 1px solid #dbdbdb; border-radius: 4px; font-size: 13px;">
                        <button type="submit" style="background: #0095f6; color: white; border: none; border-radius: 4px; padding: 6px 12px; font-size: 13px; cursor: pointer;">שלח</button>
                    </form>
                </div>
            </div>
        `;

        feedContainer.appendChild(postElement);
    });
}

async function handleDeletePost(postId) {
    if (!confirm('האם את בטוחה שברצונך למחוק פוסט זה?')) return;

    try {
        const response = await fetch(`/api/posts/${postId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadPostsViaAjax(); // טעינה מחדש של הפיד
        } else {
            const errData = await response.json();
            alert('שגיאה במחיקה: ' + (errData.error || 'אין הרשאה'));
        }
    } catch (err) {
        console.error('Delete post error:', err);
    }
}

async function handleLike(postId) {
    try {
        const response = await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
        if (response.ok) {
            const data = await response.json();
            const countEl = document.getElementById(`likes-count-${postId}`);
            if (countEl) countEl.innerText = `${data.likesCount} לייקים`;
        }
    } catch (err) {
        console.error('Like error:', err);
    }
}

async function handleComment(e, postId) {
    e.preventDefault();
    const input = e.target.querySelector('input');
    const text = input ? input.value : '';

    try {
        const response = await fetch(`/api/posts/${postId}/comment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });

        if (response.ok) {
            input.value = '';
            loadPostsViaAjax();
        }
    } catch (err) {
        console.error('Comment error:', err);
    }
}

async function handleCreatePost(e) {
    e.preventDefault();

    const typeEl = document.getElementById('postTypeInput');
    const captionEl = document.getElementById('postCaptionInput');
    const urlEl = document.getElementById('postUrlInput');

    const type = typeEl ? typeEl.value : 'text';
    const caption = captionEl ? captionEl.value : '';
    const url = urlEl ? urlEl.value : '';

    try {
        const response = await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: caption,
                mediaType: type,
                mediaUrl: url
            })
        });

        if (response.ok) {
            if (captionEl) captionEl.value = '';
            if (urlEl) urlEl.value = '';
            loadPostsViaAjax();
        } else {
            const errData = await response.json();
            alert('שגיאה ביצירת הפוסט: ' + (errData.error || 'נסה שוב'));
        }
    } catch (err) {
        console.error('Error creating post:', err);
    }
}