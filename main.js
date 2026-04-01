const overlay = document.getElementById('img-overlay');
let activeImg = null;

document.querySelectorAll('.hover-container').forEach(container => {
    const img = container.querySelector('img');

    container.addEventListener('click', (e) => {
        e.stopPropagation();
        if (activeImg) return; // prevent double-clicks during animation

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

        // Calculate scale relative to current rendered size
        const renderScale = (naturalH * scale) / rect.height;

        img.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${renderScale})`;
        img.style.zIndex = '9999';
        img.style.filter = 'var(--drop-shadow)';
        img.style.borderRadius = '0';

        overlay.classList.add('active');
        
    });
});

overlay.addEventListener('click', () => {
    if (!activeImg) return;

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