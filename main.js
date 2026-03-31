document.querySelectorAll('.hover-container').forEach(container => {
    const img = container.querySelector('img');

    container.addEventListener('mouseenter', () => {
        const rect = img.getBoundingClientRect();

        const imgCenterX = rect.left + rect.width / 2;
        const imgCenterY = rect.top + rect.height / 2;

        const viewportCenterX = window.innerWidth / 2;
        const viewportCenterY = window.innerHeight / 2;

        const deltaX = viewportCenterX - imgCenterX;
        const deltaY = viewportCenterY - imgCenterY;

        img.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(var(--hover-scale))`;
    });

    container.addEventListener('mouseleave', () => {
        img.style.transform = '';
    });
});