// Gallery Management Simulator
document.addEventListener('DOMContentLoaded', () => {
    const galleryContainer = document.getElementById('gallery-container');

    // Simulate Dynamic Image IDs or loading from a database
    const samplePortraits = [
        { id: 1, title: 'The Silent Gaze', medium: 'Pencil Realism', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1976&auto=format&fit=crop' },
        { id: 2, title: 'Vibrant Soul', medium: 'Digital Fauvism', img: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=1972&auto=format&fit=crop' },
        { id: 3, title: 'Light in Dark', medium: 'Charcoal Express', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop' }
    ];

    // Note: Gallery is already hardcoded in index.html for SEO and layout speed,
    // but this JS can be used for dynamic loading or filtering.
    
    window.viewImage = (el) => {
        const imgSrc = el.querySelector('img').src;
        const title = el.querySelector('h4').textContent;
        
        Swal.fire({
            title: title,
            html: '<p class="text-xs uppercase tracking-widest font-black opacity-50">Masterpiece View</p>',
            imageUrl: imgSrc,
            imageAlt: title,
            imageWidth: '100%',
            confirmButtonColor: '#1A1A1A',
            confirmButtonText: 'Back to Gallery',
            showCloseButton: true,
            customClass: {
                popup: 'rounded-3xl',
                confirmButton: 'rounded-full px-8 py-3 uppercase font-black tracking-widest text-xs'
            }
        });
    }
});
