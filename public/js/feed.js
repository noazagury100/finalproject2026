document.addEventListener('DOMContentLoaded', () => {
    loadPostsViaAjax();
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

function renderPosts(posts) {
    const feedContainer = document.getElementById('feedContainer');
    if (!feedContainer) return;

    if (posts.length === 0) {
        feedContainer.innerHTML = '<p style="text-align:center;">אין פוסטים להצגה כרגע.</p>';
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

                <div class="comments-section" style="border-top: 1px solid #efefef; pt-2; margin-top: 10px;">
                    <div id="comments-list-${post._id}" style="margin-bottom: 8px;">
                        ${commentsHTML}
                    </div>
                    
                    <form onsubmit="handleComment(event, '${post._id}')" style="display: flex; gap: 5px;">
                        <input type="text" id="comment-input-${post._id}" placeholder="הוסף תגובה..." required style="flex:1; padding: 6px; font-size: 13px; border: 1px solid #dbdbdb; border-radius: 4px;">
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
        if (response.ok) {
            const data = await response.json();
            const countElement = document.getElementById(`like-count-${postId}`);
            if (countElement) countElement.innerText = data.likesCount;
        }
    } catch (error) {
        console.error('Like Error:', error);
    }
}


async function handleComment(event, postId) {
    event.preventDefault();
    const input = document.getElementById(`comment-input-${postId}`);
    if (!input || !input.value.trim()) return;

    try {
        const response = await fetch(`/api/posts/${postId}/comment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: input.value.trim() })
        });

        if (response.ok) {
            input.value = '';
            await loadPostsViaAjax(); // רענון הפיד עם התגובה החדשה
        }
    } catch (error) {
        console.error('Comment Error:', error);
    }
}


function setupCreatePostForm() {
    const createPostForm = document.getElementById('createPostForm');
    if (!createPostForm) return;

    createPostForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const postData = {
            text: document.getElementById('postCaptionInput')?.value || '',
            mediaUrl: document.getElementById('postUrlInput')?.value || '',
            mediaType: document.getElementById('postTypeInput')?.value || 'text'
        };

        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData)
            });

            if (response.ok) {
                await loadPostsViaAjax();
                createPostForm.reset();
            }
        } catch (error) {
            console.error('Create Post Error:', error);
        }
    });
}