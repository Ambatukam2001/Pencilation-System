// Gallery & Service Visualization Engine
const DEFAULT_ARTWORKS = [
    { id: 1, title: 'The Silent Gaze',   category: 'Pencil Realism',       size: 'A4',      img: 'images/portrait_sample.png', fallback: 'images/portrait_sample.png' },
    { id: 2, title: 'Vibrant Soul',       category: 'Digital Illustration', size: 'Digital', img: 'images/digital_art.png',     fallback: 'images/digital_art.png' },
    { id: 3, title: 'Midnight Shadow',    category: 'Colored Pencil',       size: 'A3',      img: 'images/colored.jpg',         fallback: 'images/colored.jpg' },
    { id: 4, title: 'Graceful Glance',    category: 'Graphite Study',       size: '9x12in',  img: 'images/gallery_1.jpg',       fallback: 'images/portrait_sample.png' },
    { id: 5, title: 'Portrait of ADEL',   category: 'Featured Work',        size: 'A4',      img: 'images/adel.JPG',            fallback: 'images/adel.JPG' },
    { id: 6, title: 'Artist\'s Vision',   category: 'Mixed Media',          size: 'A3',      img: 'images/artist_adel.png',     fallback: 'images/artist_adel.png' }
];

const DEFAULT_SERVICES = [
    {
        id: 1,
        title: "Pencil Realism Art",
        desc: '"BINI Mikha" - A breathtaking hyper-realistic pencil portrait, meticulously crafted to capture every fine detail and the most subtle micro-expressions for a truly lifelike finish.',
        img: "images/portrait_sample.png"
    },
    {
        id: 2,
        title: "Digital Drawing Art",
        desc: '"ASEAN Diversity & DMMMSU Legacy" - A professional digital commission. A vibrantly symbolic celebration of Southeast Asian unity, educational research, and cultural harmony.',
        img: "images/digital_art.png"
    },
    {
        id: 3,
        title: "Colored Drawing Art",
        desc: '"Evil Demon Slayer" - A masterful triple-panel hand-drawn illustration. Features Zenitsu, Inosuke, and Tanjiro with vibrant colored pencils, markers, and bold Japanese calligraphy.',
        img: "images/colored_art.png"
    }
];

const DEFAULT_RATES = [
    { id: 1, size: '6x8', label: 'Mini Portrait', price: '300 - 400', popular: false },
    { id: 2, size: '8.5x11', label: 'Letter Format', price: '400 - 700', popular: true },
    { id: 3, size: 'A4', label: 'Standard Size', price: '500 - 800', popular: false },
    { id: 4, size: '12x18', label: 'Large Scale', price: '1k - 1.5k', popular: false }
];

document.addEventListener('DOMContentLoaded', () => {
    // 1. Fetch & Render Gallery Logic
    window.renderGallery = async () => {
        const galleryContainer = document.getElementById('gallery-container');
        const adminGalleryGrid = document.querySelector('#gallery-tab .gallery-grid');
        
        try {
            const response = await fetch(`${CONFIG.API_URL}/artworks`);
            const artworks = response.ok ? await response.json() : DEFAULT_ARTWORKS;
            const data = (artworks && artworks.length > 0) ? artworks : DEFAULT_ARTWORKS;

            if(galleryContainer) {
                galleryContainer.innerHTML = data.map(art => `
                    <div class="portrait-card" onclick="viewImage(this)">
                        <img src="${art.image_url || art.img}" alt="${art.title}" onerror="this.src='${art.fallback || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2'}'">
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

        } catch (error) {
            console.error("Gallery Sync Error:", error);
        }
    };

    // 2. Render Services Logic
    window.renderServices = async () => {
        const servicesGrid = document.getElementById('services-grid-container');
        const bookingMedium = document.getElementById('booking-medium');
        
        try {
            const response = await fetch(`${CONFIG.API_URL}/services`);
            const services = response.ok ? await response.json() : DEFAULT_SERVICES;
            const data = (services && services.length > 0) ? services : DEFAULT_SERVICES;

            if(servicesGrid) {
                servicesGrid.innerHTML = data.map(service => `
                    <div class="group border-b border-gray-100 pb-12">
                        <div class="aspect-square bg-[#FDFBF7] overflow-hidden mb-8 relative">
                            <img src="${service.image_url || service.img}" alt="${service.title}"
                                class="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-all duration-700">
                        </div>
                        <h3 class="text-lg font-black uppercase tracking-[0.2em] mb-4 text-[#1A1A1A] font-sans pt-4">${service.title}</h3>
                        <p class="opacity-60 text-[11px] leading-relaxed line-clamp-3">${service.description || service.desc}</p>
                    </div>
                `).join('');
            }
            
            if(bookingMedium) {
                bookingMedium.innerHTML = data.map(service => `<option value="${service.title}">${service.title}</option>`).join('');
            }
        } catch (error) {
            console.error("Services Sync Error:", error);
        }
    };

    // 3. Render Rates Logic
    window.renderRates = async () => {
        const ratesContainer = document.querySelector('#rates .md\\:w-2\\/3');
        const bookingSize = document.getElementById('booking-size');

        try {
            const response = await fetch(`${CONFIG.API_URL}/rates`);
            const rates = response.ok ? await response.json() : DEFAULT_RATES;
            const data = (rates && rates.length > 0) ? rates : DEFAULT_RATES;

            if(ratesContainer) {
                ratesContainer.innerHTML = data.map(rate => {
                    const isPopular = rate.popular || rate.size === '8.5x11' || rate.size === '9 x 12';
                    return isPopular ? `
                        <div class="p-8 bg-[#1A1A1A] text-white rounded-[3rem] shadow-2xl relative group flex flex-col justify-between h-full">
                            <div class="absolute -top-4 -right-4 bg-[#C16053] text-[9px] font-black uppercase px-6 py-2 rounded-full tracking-widest shadow-xl">Standard</div>
                            <div>
                                <p class="text-[10px] font-black uppercase tracking-widest text-[#C16053] mb-6 tracking-[0.2em]">${rate.label}</p>
                                <h4 class="text-4xl font-black mb-2 uppercase">${rate.size}</h4>
                                <p class="text-[9px] font-black uppercase opacity-30 tracking-[0.3em] mb-12 italic">Most Popular Choice</p>
                            </div>
                            <div class="text-xl font-black tracking-widest">
                                <span class="text-sm opacity-30">₱</span>${rate.price}
                            </div>
                        </div>
                    ` : `
                        <div class="p-8 border-2 border-gray-100 rounded-[3rem] hover:border-[#1A1A1A] transition-all group flex flex-col justify-between h-full bg-white">
                            <div>
                                <p class="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-6 tracking-[0.2em]">${rate.label}</p>
                                <h4 class="text-4xl font-black mb-2 uppercase">${rate.size}</h4>
                                <p class="text-[9px] font-black uppercase text-[#C16053] tracking-[0.3em] mb-12 italic">Premium Quality</p>
                            </div>
                            <div class="text-xl font-black tracking-widest">
                                <span class="text-sm opacity-30">₱</span>${rate.price}
                            </div>
                        </div>
                    `;
                }).join('');
            }
            
            if(bookingSize) {
                bookingSize.innerHTML = data.map(rate => `<option value="${rate.size}">${rate.size} (₱${rate.price})</option>`).join('');
            }
        } catch (error) {
            console.error("Rates Sync Error:", error);
        }
    };

    // 4. Gallery Utilities
    window.viewImage = (el) => {
        const imgSrc = el.querySelector('img').src;
        const title = el.querySelector('h4').textContent;
        Swal.fire({
            title: title,
            imageUrl: imgSrc,
            imageWidth: '100%',
            confirmButtonColor: '#1A1A1A',
            customClass: { popup: 'rounded-3xl' }
        });
    };

    window.scrollGallery = (dir) => {
        const slider = document.getElementById('gallery-container');
        if(slider) slider.scrollBy({ left: dir * 344, behavior: 'smooth' });
    };

    // Initialize all
    renderGallery();
    renderServices();
    renderRates();
});

// Real-time Sync
window.addEventListener('storage', (e) => {
    if(['gallery_data', 'services_data', 'rates_data'].includes(e.key)) {
        if(typeof renderGallery === 'function') renderGallery();
        if(typeof renderServices === 'function') renderServices();
        if(typeof renderRates === 'function') renderRates();
    }
});
