const overlay = document.getElementById('img-overlay');
const overlayImg = document.getElementById('img-overlay-img');

document.querySelectorAll('.hover-container').forEach(container => {
    const img = container.querySelector('img');

    container.addEventListener('click', (e) => {
        e.stopPropagation();

        const naturalW = img.naturalWidth;
        const naturalH = img.naturalHeight;

        const maxW = window.innerWidth * 0.9;
        const maxH = window.innerHeight * 0.9;

        const scale = Math.min(1, maxW / naturalW, maxH / naturalH);

        overlayImg.src = img.src;
        overlayImg.style.width = `${naturalW * scale}px`;
        overlayImg.style.height = `${naturalH * scale}px`;

        overlay.classList.add('active');
    });
});

overlay.addEventListener('click', () => {
    overlay.classList.remove('active');
    overlayImg.src = '';
});