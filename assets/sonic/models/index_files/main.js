const overlay = document.getElementById('img-overlay');
let activeImg = null;
let isOpening = false;

document.querySelectorAll('.hover-container').forEach(container => {
    const img = container.querySelector('img');

    container.addEventListener('click', () => {
        if (activeImg) return;

        isOpening = true;
        activeImg = img;

        const naturalW = img.naturalWidth;
        const naturalH = img.naturalHeight;
        const maxW = window.innerWidth * 0.9;
        const maxH = window.innerHeight * 0.9;
        const scale = Math.min(1, maxW / naturalW, maxH / naturalH);

        const rect = img.getBoundingClientRect();
        const imgCenterX = rect.left + rect.width / 2;
        const imgCenterY = rect.top + rect.height / 2;
        const deltaX = window.innerWidth / 2 - imgCenterX;
        const deltaY = window.innerHeight / 2 - imgCenterY;
        const renderScale = (naturalH * scale) / rect.height;

        img.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${renderScale})`;
        img.style.zIndex = '9999';
        img.style.filter = 'var(--drop-shadow)';
        img.style.borderRadius = '0';

        overlay.classList.add('active');

        // Allow the document listener to respond after this click has fully resolved
        requestAnimationFrame(() => { isOpening = false; });
    });
});

document.addEventListener('click', () => {
    if (isOpening || !activeImg) return;

    overlay.classList.remove('active');
    activeImg.style.transform = '';
    activeImg.style.filter = '';
    activeImg.style.borderRadius = '';

    activeImg.addEventListener('transitionend', () => {
        activeImg.style.zIndex = '';
        activeImg = null;
    }, { once: true });
});

// On load, apply saved theme (or default to "default")
const savedTheme = localStorage.getItem('theme') || 'default';
document.documentElement.dataset.theme = savedTheme;

document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        document.documentElement.dataset.theme = theme;
        localStorage.setItem('theme', theme);
    });
});