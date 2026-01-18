(function() {
    'use strict';

    const originalFetch = window.fetch;

    function formatFullDate(isoString) {
        if (!isoString) return null;
        const date = new Date(isoString);

        const datePart = date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        const timePart = date.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });

        return `${datePart} в ${timePart}`;
    }

    function updateUI(formattedDate) {
        let attempts = 0;
        const interval = setInterval(() => {
            attempts++;
            if (attempts > 20) clearInterval(interval);

            const metaItems = document.querySelectorAll('.profile-meta__item span');

            for (const span of metaItems) {
                if (span.textContent.includes('Регистрация:')) {
                    if (!span.textContent.includes(formattedDate)) {
                        span.textContent = `Регистрация: ${formattedDate}`;
                        span.style.color = '#e0e0e0'; 
                    }
                    clearInterval(interval);
                    break;
                }
            }
        }, 100);
    }


    window.fetch = async function(...args) {
        const response = await originalFetch(...args);

        const url = (typeof args[0] === 'string') ? args[0] : args[0].url;

        if (url && url.includes('/api/users/') && !url.includes('/files/')) {

            const clone = response.clone();

            clone.json().then(data => {
                if (data && data.createdAt) {
                    console.log('✅ Перехвачена дата регистрации:', data.createdAt);
                    const niceDate = formatFullDate(data.createdAt);
                    updateUI(niceDate);
                }
            }).catch(() => {
            });
        }

        return response;
    };

})();
