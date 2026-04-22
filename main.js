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

// ─────────────────────────────────────────────
// EMAIL — hover to reveal, click to copy
// ─────────────────────────────────────────────

const EMAIL = 'philnegron.95@gmail.com';

const footerLinks  = document.querySelector('.footer-links');
const emailLink    = footerLinks?.querySelector('a[href*="mailto"], a:first-child');

if (footerLinks && emailLink) {

    // Inject the reveal element once
    const reveal = document.createElement('span');
    reveal.className = 'footer-email-reveal';
    reveal.textContent = EMAIL;
    reveal.setAttribute('aria-label', 'Click to copy email address');
    footerLinks.appendChild(reveal);

    // Track whether the cursor is over the footer-links area
    let leaveTimer = null;

    function showEmail() {
        clearTimeout(leaveTimer);
        footerLinks.classList.add('email-hover');
    }

    function hideEmail() {
        // Small delay so a slight cursor wobble doesn't flicker it
        leaveTimer = setTimeout(() => {
            footerLinks.classList.remove('email-hover');
            // Reset to address after faded out
            setTimeout(() => { reveal.textContent = EMAIL; }, 200);
        }, 80);
    }

    emailLink.addEventListener('mouseenter', showEmail);
    footerLinks.addEventListener('mouseleave', hideEmail);

    // Keep it visible if the cursor moves to the reveal span itself
    reveal.addEventListener('mouseenter', showEmail);

    // Copy on click
    reveal.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(EMAIL);
        } catch {
            // Fallback for older browsers
            const ta = document.createElement('textarea');
            ta.value = EMAIL;
            ta.style.cssText = 'position:fixed;opacity:0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            ta.remove();
        }

        reveal.textContent = 'COPIED';

        // Restore the address text after a beat
        setTimeout(() => { reveal.textContent = EMAIL; }, 1800);
    });
}

const navLinks  = document.querySelector('.nav-links');
const navEmail  = navLinks?.querySelector('.email-link');
 
if (navLinks && navEmail) {
 
    const navReveal = document.createElement('span');
    navReveal.className = 'nav-email-reveal';
    navReveal.textContent = EMAIL;
    navReveal.setAttribute('aria-label', 'Click to copy email address');
    navLinks.appendChild(navReveal);
 
    let navLeaveTimer = null;
 
    function showNavEmail() {
        clearTimeout(navLeaveTimer);
        navLinks.classList.add('email-hover');
    }
 
    function hideNavEmail() {
        navLeaveTimer = setTimeout(() => {
            navLinks.classList.remove('email-hover');
            setTimeout(() => { navReveal.textContent = EMAIL; }, 200);
        }, 80);
    }
 
    navEmail.addEventListener('mouseenter', showNavEmail);
    navLinks.addEventListener('mouseleave', hideNavEmail);
    navReveal.addEventListener('mouseenter', showNavEmail);
 
    navReveal.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(EMAIL);
        } catch {
            const ta = document.createElement('textarea');
            ta.value = EMAIL;
            ta.style.cssText = 'position:fixed;opacity:0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            ta.remove();
        }
 
        navReveal.textContent = 'COPIED';
        setTimeout(() => { navReveal.textContent = EMAIL; }, 1800);
    });
}
