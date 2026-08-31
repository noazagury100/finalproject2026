document.addEventListener('DOMContentLoaded', () => {
    const tabLogin = document.getElementById('tabLogin');
    const tabRegister = document.getElementById('tabRegister');
    const authSubmitBtn = document.getElementById('authSubmitBtn');
    const authForm = document.getElementById('authForm');
    let isRegisterMode = false;

    if (tabLogin && tabRegister) {
        tabLogin.addEventListener('click', () => {
            isRegisterMode = false;
            tabLogin.style.color = '#0095f6';
            tabRegister.style.color = '#8e8e8e';
            authSubmitBtn.innerText = 'התחבר';
        });

        tabRegister.addEventListener('click', () => {
            isRegisterMode = true;
            tabRegister.style.color = '#0095f6';
            tabLogin.style.color = '#8e8e8e';
            authSubmitBtn.innerText = 'הרשם';
        });
    }

    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('authUsername').value.trim();
            const password = document.getElementById('authPassword').value.trim();

            if (!username || !password) {
                alert('נא להזין שם משתמש וסיסמה');
                return;
            }

            const endpoint = isRegisterMode ? '/api/auth/register' : '/api/auth/login';

            try {
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await res.json();

                if (res.ok) {
                    window.location.href = '/';
                } else {
                    alert(data.error || 'שגיאה בביצוע הפעולה');
                }
            } catch (err) {
                console.error('Auth error:', err);
                alert('שגיאה בתקשורת מול השרת');
            }
        });
    }
});