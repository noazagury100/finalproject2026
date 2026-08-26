
document.addEventListener('DOMContentLoaded', () => {
    loadPostsViaAjax();
    loadGroupsViaAjax();
});


async function loadPostsViaAjax() {
    try {
        const response = await fetch('/api/posts');
        
        if (!response.ok) {
            throw new Error('שגיאה בטעינת הפוסטים');
        }

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
        const sidebarList = document.querySelector('.sidebar ul');
        
        if (sidebarList && groups.length > 0) {
            sidebarList.innerHTML = groups.map(g => `<li>👥 ${g.name}</li>`).join('');
        }
    } catch (err) {
        console.error('Error fetching groups:', err);
    }
}


function renderPosts(posts) {
    const feedContainer = document.querySelector('.feed-section');
    if (!feedContainer) return;

    if (posts.length === 0) {
        feedContainer.innerHTML = '<p>אין פוסטים להצגה כרגע.</p>';
        return;
    }

    feedContainer.innerHTML = '';

    posts.forEach(post => {
        const postElement = document.createElement('article');
        postElement.classList.add('post');

        postElement.innerHTML = `
            <header class="post-header">
                <img src="${post.userAvatar || 'https://via.placeholder.com/40'}" alt="תמונה" class="avatar">
                <span class="username">${post.username || 'משתמש'}</span>
            </header>
            
            <div class="post-content">
                <p>${post.text || ''}</p>
                ${post.mediaUrl ? `<img src="${post.mediaUrl}" alt="מדיה" style="width:100%;">` : ''}
            </div>

            <div class="post-actions">
                <button class="btn-like">❤️ לייק (${post.likes || 0})</button>
            </div>
        `;

        feedContainer.appendChild(postElement);
    });
}