// UI Logic for Landing Page
document.addEventListener('DOMContentLoaded', () => {
    // 1. Smooth Scrolling for Navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Offset for fixed nav
                    behavior: 'smooth'
                });
            }
        });
    });

    // 2. Sticky Navbar Effect
    const mainNav = document.getElementById('main-nav');
    window.addEventListener('scroll', () => {
        if(window.scrollY > 50) {
            mainNav.classList.remove('bg-transparent', 'py-6', 'border-none');
            mainNav.classList.add('bg-white', 'py-4', 'border-b', 'border-gray-100', 'shadow-sm');
        } else {
            mainNav.classList.add('bg-transparent', 'py-6', 'border-none');
            mainNav.classList.remove('bg-white', 'py-4', 'border-b', 'border-gray-100', 'shadow-sm');
        }
    });

    // 3. Mobile Menu Toggle System
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileClose = document.getElementById('mobile-close');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    if(mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', () => {
            mobileMenu.classList.add('translate-x-0');
            mobileMenu.classList.remove('translate-x-full');
            document.body.style.overflow = 'hidden';
        });
    }

    if(mobileClose && mobileMenu) {
        mobileClose.addEventListener('click', () => {
             mobileMenu.classList.remove('translate-x-0');
             mobileMenu.classList.add('translate-x-full');
             document.body.style.overflow = 'auto';
        });
    }

    // Close menu when navigation links are clicked
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
             mobileMenu.classList.remove('translate-x-0');
             mobileMenu.classList.add('translate-x-full');
             document.body.style.overflow = 'auto';
        });
    });

    // 4. Hero Animation & Meetup Detection
    const meetupNotice = document.getElementById('user-meetup-notice');
    const meetupName = document.getElementById('user-meetup-name');
    const meetupLoc = localStorage.getItem('meetup_location');
    const chatWrapper = document.getElementById('user-chat-wrapper');

    if(chatWrapper) chatWrapper.classList.remove('hidden');

    if(meetupLoc && meetupNotice) {
        meetupNotice.classList.remove('hidden');
        const locMap = {
            'sm_aura': 'SM Aura Premier, BGC',
            'uptown_mall': 'Uptown Mall, BGC',
            'venice_grand': 'Venice Grand Canal Mall',
            'market_market': 'Market! Market!'
        };
        if(meetupName) meetupName.textContent = locMap[meetupLoc] || meetupLoc;
    }

    // Live Session Status Check
    const liveBadge = document.getElementById('artist-live-badge');
    const liveLink = document.getElementById('live-session-link');
    const isArtistLive = localStorage.getItem('is_live_session') === 'true';
    const artistLiveUrl = localStorage.getItem('live_meeting_url');

    if(liveBadge && isArtistLive) {
        liveBadge.classList.replace('hidden', 'flex');
        if(liveLink && artistLiveUrl) {
            liveLink.href = artistLiveUrl;
        }
    }
});

// Logout Utility
function logout() {
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_role');
    window.location.href = 'login.html';
}
