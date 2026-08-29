document.addEventListener('DOMContentLoaded', () => {
    let mode = 'login'; 

    const tabLogin = document.getElementById('tabLogin');
    const tabRegister = document.getElementById('tabRegister');
    const authForm = document.getElementById('authForm');
    const authSubmitBtn = document.getElementById('authSubmitBtn');
    const authMessage = document.getElementById('authMessage');

    
    tabLogin.addEventListener('click', () => {
        mode = 'login';
        tabLogin.style.color = '#0095f6';
        tabRegister.style.color = '#8e8e8e';
        authSubmitBtn.innerText = 'התחבר';
        authMessage.style.display = 'none';
    });

    
    tabRegister.addEventListener('click', () => {
        mode = 'register';
        tabRegister.style.color = '#0095f6';
        tabLogin.style.color = '#8e8e8e';
        authSubmitBtn.innerText = 'הרשם';
        authMessage.style.display = 'none';
    });

    
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('authUsername').value.trim();
        const password = document.getElementById('authPassword').value.trim();

        if (!username || !password) {
            showMessage('נא למלא שם משתמש וסיסמה', 'red');
            return;
        }

        const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(mode === 'login' ? 'התחברת בהצלחה! מעביר לפיד...' : 'נרשמת בהצלחה! מעביר לפיד...', 'green');
                setTimeout(() => {
                    window.location.href = '/'; // מעביר לפיד הראשי
                }, 1000);
            } else {
                showMessage(data.error || 'אירעה שגיאה', 'red');
            }
        } catch (error) {
            showMessage('שגיאה בתקשורת מול השרת', 'red');
        }
    });

    function showMessage(text, color) {
        authMessage.innerText = text;
        authMessage.style.color = color;
        authMessage.style.display = 'block';
    }
});