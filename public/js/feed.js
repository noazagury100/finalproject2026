let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
    await fetchCurrentUser();
    loadPosts();

    const createPostForm = document.getElementById('createPostForm');
    if (createPostForm) {
        createPostForm.addEventListener('submit', handleCreatePost);
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

function toggleMediaInput() {
    const typeSelect = document.getElementById('mediaType');
    const input = document.getElementById('mediaUrl');
    if (!typeSelect || !input) return;

    if (typeSelect.value === 'none') {
        input.style.display = 'none';
        input.value = '';
    } else {
        input.style.display = 'block';
        input.placeholder = typeSelect.value === 'image' ? 'הדבק קישור לתמונה' : 'הדבק קישור לסרטון';
    }
}

async function loadPosts() {
    try {
        const res = await fetch('/api/posts');
        const posts = await res.json();
        renderPosts(posts);
    } catch (err) {
        console.error('Error loading posts:', err);
    }
}

function renderPosts(posts) {
    const container = document.getElementById('postsContainer');
    if (!container) return;

    if (!posts || posts.length === 0) {
        container.innerHTML = '<p>אין פוסטים להצגה בפיד.</p>';
        return;
    }

    container.innerHTML = posts.map(p => {
        const authorName = p.author ? (p.author.username || p.author) : 'משתמש';
        const isOwner = currentUser && (currentUser.username === authorName || currentUser.id === (p.author._id || p.author));
        const postContent = (p.content && p.content !== 'undefined') ? p.content : '';
        const likesCount = p.likesCount || 0;
        
        const dateStr = p.createdAt ? new Date(p.createdAt).toLocaleDateString('he-IL', {
            hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'numeric'
        }) : '';

        const commentsHtml = (p.comments && p.comments.length > 0)
            ? p.comments.map(c => `
                <div style="font-size: 13px; margin-top: 4px; background: #fafafa; padding: 4px 8px; border-radius: 4px;">
                    <strong>${c.username || 'אנונימי'}:</strong> ${c.text}
                </div>
            `).join('')
            : '';

        return `
            <article class="post-card" style="border: 1px solid #dbdbdb; background: #fff; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div style="font-weight: bold; color: #262626;">👤 ${authorName}</div>
                    <small style="color: #8e8e8e; font-size: 12px;">${dateStr}</small>
                </div>

                ${postContent ? `<div style="font-size: 15px; margin-bottom: 10px; color: #333;">${postContent}</div>` : ''}
                ${p.imageUrl ? `<img src="${p.imageUrl}" style="max-width: 100%; border-radius: 6px; margin-bottom: 10px; display: block;">` : ''}
                ${p.videoUrl ? `<video controls style="max-width: 100%; border-radius: 6px; margin-bottom: 10px; display: block;"><source src="${p.videoUrl}" type="video/mp4"></video>` : ''}
                
                <div style="display: flex; align-items: center; gap: 15px; margin-top: 12px; border-top: 1px solid #efefef; padding-top: 10px;">
                    <button onclick="toggleLike('${p._id}')" style="background: none; border: none; cursor: pointer; font-size: 15px; color: #e1306c; font-weight: bold;">
                        ❤️ <span id="like-count-${p._id}">${likesCount}</span> לייקים
                    </button>
                </div>

                <div style="margin-top: 10px;">
                    ${commentsHtml}
                    <form onsubmit="handleAddComment(event, '${p._id}')" style="display: flex; gap: 8px; margin-top: 8px;">
                        <input type="text" id="comment-input-${p._id}" placeholder="הוסף תגובה..." style="flex: 1; padding: 6px; border: 1px solid #dbdbdb; border-radius: 4px; font-size: 13px;">
                        <button type="submit" style="background: #0095f6; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 12px;">שלח</button>
                    </form>
                </div>

                ${isOwner ? `
                    <div style="display: flex; gap: 10px; margin-top: 12px; border-top: 1px dashed #dbdbdb; padding-top: 8px;">
                        <button onclick="editPost('${p._id}', '${postContent}')" style="background: #ffc107; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-weight: bold;">ערוך</button>
                        <button onclick="deletePost('${p._id}')" style="background: #ed4956; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-weight: bold;">מחק</button>
                    </div>
                ` : ''}
            </article>
        `;
    }).join('');
}

async function handleCreatePost(e) {
    e.preventDefault();
    const contentEl = document.getElementById('postContent');
    const mediaTypeEl = document.getElementById('mediaType');
    const mediaUrlEl = document.getElementById('mediaUrl');

    const content = contentEl ? contentEl.value : '';
    const mediaType = mediaTypeEl ? mediaTypeEl.value : 'none';
    const mediaUrl = mediaUrlEl ? mediaUrlEl.value : '';

    try {
        const res = await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content, mediaType, mediaUrl })
        });

        if (res.ok) {
            document.getElementById('createPostForm').reset();
            toggleMediaInput();
            loadPosts();
        } else {
            const err = await res.json();
            alert(err.error || 'שגיאה ביצירת הפוסט');
        }
    } catch (err) {
        console.error(err);
    }
}

async function toggleLike(id) {
    try {
        const res = await fetch(`/api/posts/${id}/like`, { method: 'POST' });
        if (res.ok) {
            const data = await res.json();
            const countEl = document.getElementById(`like-count-${id}`);
            if (countEl) countEl.innerText = data.likesCount;
        }
    } catch (err) {
        console.error(err);
    }
}

async function handleAddComment(e, postId) {
    e.preventDefault();
    const inputEl = document.getElementById(`comment-input-${postId}`);
    if (!inputEl || !inputEl.value.trim()) return;

    try {
        const res = await fetch(`/api/posts/${postId}/comment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: inputEl.value.trim() })
        });

        if (res.ok) {
            inputEl.value = '';
            loadPosts();
        }
    } catch (err) {
        console.error(err);
    }
}

async function editPost(id, oldContent) {
    const newContent = prompt('עדכני את הפוסט:', oldContent);
    if (!newContent) return;

    const res = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent })
    });

    if (res.ok) loadPosts();
}

async function deletePost(id) {
    if (!confirm('למחוק פוסט זה?')) return;
    const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    if (res.ok) loadPosts();
}