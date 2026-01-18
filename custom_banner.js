(function() {
    'use strict';

    const API_BASE = 'https://xn--d1ah4a.com/api';

    async function getAccessToken() {
        const response = await fetch(`${API_BASE}/v1/auth/refresh`, {
            method: 'POST',
        });
        if (!response.ok) throw new Error('Ошибка обновления токена');
        const data = await response.json();
        return data.accessToken;
    }

    async function uploadFile(file, token) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE}/files/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        if (!response.ok) throw new Error('Ошибка при загрузке файла');
        return await response.json();
    }

    async function updateProfileBanner(fileId, token) {
        const response = await fetch(`${API_BASE}/users/me`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ bannerId: fileId })
        });
        if (!response.ok) throw new Error('Ошибка при обновлении профиля');
        return await response.json();
    }

    async function handleFileUpload(file, button) {
        const originalTitle = button.title;
        try {
            button.title = "Загрузка...";
            button.style.opacity = "0.5";

            console.log('Шаг 1: Обновление токена...');
            const token = await getAccessToken();

            console.log('Шаг 2: Отправка файла...');
            const uploadRes = await uploadFile(file, token);

            console.log('Шаг 3: Привязка баннера...');
            await updateProfileBanner(uploadRes.id, token);

            alert('Баннер успешно обновлен! Обновите страницу.');
        } catch (err) {
            console.error(err);
            alert('Ошибка: ' + err.message);
        } finally {
            button.title = originalTitle;
            button.style.opacity = "1";
        }
    }

    function init() {
        const container = document.querySelector('.profile-banner__actions');

        if (container && !document.getElementById('tm-upload-btn')) {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/png, image/jpeg, image/gif';
            fileInput.style.display = 'none';
            fileInput.id = 'tm-file-input';

            const newBtn = document.createElement('button');
            newBtn.id = 'tm-upload-btn';
            newBtn.className = 'profile-banner__btn svelte-9mur0y';
            newBtn.title = 'Загрузить новый баннер';

            newBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 8H15.01M3 6C3 5.20435 3.31607 4.44129 3.87868 3.87868C4.44129 3.31607 5.20435 3 6 3H18C18.7956 3 19.5587 3.31607 20.1213 3.87868C20.6839 4.44129 21 5.20435 21 6V18C21 18.7956 20.6839 20.1213 20.1213 20.1213C19.5587 20.6839 18.7956 21 18 21H6C5.20435 21 4.44129 20.6839 3.87868 20.1213C3.31607 19.5587 3 18.7956 3 18V6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M3 16L8 11C8.928 10.107 10.072 10.107 11 11L16 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M14 14L15 13C15.928 12.107 17.072 12.107 18 13L21 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>`;

            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                fileInput.click();
            });

            fileInput.addEventListener('change', () => {
                if (fileInput.files.length > 0) {
                    handleFileUpload(fileInput.files[0], newBtn);
                }
            });

            container.appendChild(newBtn);
            document.body.appendChild(fileInput);
        }
    }

    const observer = new MutationObserver(init);
    observer.observe(document.body, { childList: true, subtree: true });
    init();
})();