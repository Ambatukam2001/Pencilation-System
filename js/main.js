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

    // 3. Mobile Menu Toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('is-active');
        const isOpen = mobileMenu.classList.contains('translate-x-0');
        if(isOpen) {
            mobileMenu.classList.remove('translate-x-0');
            mobileMenu.classList.add('translate-x-full');
            document.body.style.overflow = 'auto';
        } else {
            mobileMenu.classList.add('translate-x-0');
            mobileMenu.classList.remove('translate-x-full');
            document.body.style.overflow = 'hidden';
        }
    });
});

// Close Mobile Menu Utility
function toggleMenu() {
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    mobileToggle.classList.remove('is-active');
    mobileMenu.classList.remove('translate-x-0');
    mobileMenu.classList.add('translate-x-full');
    document.body.style.overflow = 'auto';
}

// 4. Hero Animation on Load
window.onload = () => {
    document.querySelectorAll('.animate-fade-in-up').forEach(el => {
        el.classList.add('opacity-100', 'translate-y-0');
    });
    // Always check for meetups for the current user session (Simulated)
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
};

// 8. Booking Map Logic (Leaflet)
document.addEventListener('DOMContentLoaded', () => {
    const mapDiv = document.getElementById('booking-map-picker');
    const addressInput = document.getElementById('booking-address-input');
    if(!mapDiv) return;

    // BGC Center
    const bgc = [14.5492, 121.0450];
    const map = L.map('booking-map-picker', {
        zoomControl: false // Hide default top-left control
    }).setView(bgc, 16);

    // Add zoom control to bottom-right
    L.control.zoom({
        position: 'bottomright'
    }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);

    // Draggable Marker
    let selectedLatLng = { lat: bgc[0], lng: bgc[1] };
    const marker = L.marker(bgc, {
        draggable: true
    }).addTo(map);

    marker.on('dragend', function(e) {
        const position = marker.getLatLng();
        selectedLatLng = { lat: position.lat, lng: position.lng };
        console.log("Location Picked:", position);
        if(addressInput) {
            addressInput.value = `📍 Map Location: ${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`;
        }
    });

    // Function to search location
    window.searchMapLocation = async () => {
        const input = document.getElementById('map-search-input');
        const query = input.value.trim();
        if(!query) return;

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            const data = await response.json();
            
            if(data && data.length > 0) {
                const { lat, lon } = data[0];
                const newPos = [parseFloat(lat), parseFloat(lon)];
                
                map.setView(newPos, 16);
                marker.setLatLng(newPos);
                selectedLatLng = { lat: newPos[0], lng: newPos[1] };
                
                if(addressInput) {
                    addressInput.value = `📍 Map Location: ${newPos[0].toFixed(4)}, ${newPos[1].toFixed(4)} (${query})`;
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Location not found',
                    text: 'Try searching for a more specific place or landmark.',
                    confirmButtonColor: '#1A1A1A'
                });
            }
        } catch (error) {
            console.error("Search Error:", error);
        }
    };

    // Function to open Google Maps in new tab
    window.openExternalGoogleMap = () => {
        const url = `https://www.google.com/maps/search/?api=1&query=${selectedLatLng.lat},${selectedLatLng.lng}`;
        window.open(url, '_blank');
    };

    // Handle Tab/Visibility Resize Fix
    window.addEventListener('click', () => {
        setTimeout(() => map.invalidateSize(), 300);
    });
});

// 9. Gallery State Management
const DEFAULT_ARTWORKS = [
    { id: 1, title: 'The Silent Gaze', category: 'Featured Pencil', size: 'A4', price: '1,500', img: 'images/gallery_1.jpg', fallback: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1976&auto=format&fit=crop' },
    { id: 2, title: 'Vibrant Soul', category: 'Digital Illustration', size: 'Digital', price: '2,200', img: 'images/gallery_2.jpg', fallback: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=1972&auto=format&fit=crop' },
    { id: 3, title: 'Midnight Shadow', category: 'Charcoal Study', size: 'A3', price: '2,800', img: 'images/gallery_3.jpg', fallback: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop' },
    { id: 4, title: 'Urban Profile', category: 'Mix Media', size: 'A4', price: '1,800', img: 'images/gallery_4.jpg', fallback: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop' },
    { id: 5, title: 'Reflection', category: 'Monochrome Pencil', size: 'A5', price: '900', img: 'images/gallery_5.jpg', fallback: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1964&auto=format&fit=crop' },
    { id: 6, title: 'Study in Grey', category: 'Graphite Sketch', size: 'A4', price: '1,200', img: 'images/gallery_6.jpg', fallback: 'https://images.unsplash.com/photo-1560707854-fb9a10eeaace?q=80&w=1974&auto=format&fit=crop' }
];

window.renderGallery = () => {
    const galleryContainer = document.getElementById('gallery-container');
    const adminGalleryGrid = document.querySelector('#gallery-tab .gallery-grid');
    const artworks = JSON.parse(localStorage.getItem('gallery_data')) || DEFAULT_ARTWORKS;
    
    // Save to localStorage if not present
    if(!localStorage.getItem('gallery_data')) {
        localStorage.setItem('gallery_data', JSON.stringify(DEFAULT_ARTWORKS));
    }

    if(galleryContainer) {
        galleryContainer.innerHTML = artworks.map(art => `
            <div class="portrait-card" onclick="viewImage(this)">
                <img src="${art.img}" alt="${art.title}" onerror="this.src='${art.fallback}'">
                <div class="overlay-info">
                    <p class="text-[10px] uppercase tracking-widest mb-1 italic opacity-60">${art.category}</p>
                    <h4 class="text-xl font-bold uppercase tracking-widest mb-2">${art.title}</h4>
                    <div class="flex items-center justify-between border-t border-white/20 pt-3 mt-1">
                        <span class="text-[10px] font-black uppercase tracking-widest">Size: <span class="artwork-size">${art.size}</span></span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    if(adminGalleryGrid) {
        adminGalleryGrid.innerHTML = artworks.map(art => `
            <div class="portrait-card rounded-[2rem] overflow-hidden group border-8 border-white shadow-xl relative" data-id="${art.id}">
                <img src="${art.img}" onerror="this.src='${art.fallback}'" class="group-hover:scale-110 transition-transform duration-700">
                <div class="overlay-info p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                     <p class="text-[10px] uppercase font-black text-[#C16053] tracking-widest">${art.category}</p>
                     <h4 class="text-xl font-bold text-white uppercase tracking-widest mb-2">${art.title}</h4>
                     <div class="flex items-center justify-between border-t border-white/20 pt-3 mt-1">
                         <span class="text-[9px] font-black uppercase text-white tracking-widest">Size: <span class="artwork-size">${art.size}</span></span>
                     </div>
                </div>
                <div class="absolute top-6 right-6 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onclick="editImage(this)" class="w-10 h-10 bg-white text-[#1A1A1A] rounded-full flex items-center justify-center hover:bg-[#C16053] hover:text-white transition-all shadow-lg">
                        <i data-lucide="edit-3" class="w-4 h-4"></i>
                    </button>
                    <button onclick="deleteImage(this)" class="w-10 h-10 bg-white text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        `).join('');
        lucide.createIcons(); // Re-initialize icons for dynamic content
    }
};

// Auto-render on load
document.addEventListener('DOMContentLoaded', renderGallery);

// Real-time Sync for Gallery
window.addEventListener('storage', (e) => {
    if(e.key === 'gallery_data') {
        renderGallery();
    }
});

// 10. Logout Logic
function logout() {
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_role');
    window.location.href = 'login.html';
}

// 7. Chat Logic Removed

// 8. Booking Map Logic Removed


