// Dashboard Logic for User/Admin Role Simulator
document.addEventListener('DOMContentLoaded', () => {
    // 1. Detect Role via URL and LocalStorage
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get('role');
    const storedRole = localStorage.getItem('user_role');
    const storedName = localStorage.getItem('user_name');
    
    const headerTitle = document.getElementById('tab-title');
    const dashboardName = document.getElementById('dashboard-user-name');
    const dashboardRole = document.getElementById('dashboard-user-role');

    // Handle Admin Logic
    const isAdmin = (storedRole === 'admin' || role === 'admin');

    if(isAdmin) {
        if(dashboardName) dashboardName.textContent = "ADEL";
        if(dashboardRole) dashboardRole.textContent = "SUPER ADMIN";
        if(headerTitle) headerTitle.textContent = "OVERVIEW";
        const adminControls = document.getElementById('admin-map-controls');
        if(adminControls) adminControls.classList.remove('hidden');
        renderAdminRequests();
    } else {
        if(dashboardName) dashboardName.textContent = storedName || "Guest User";
        if(dashboardRole) dashboardRole.textContent = "Client Profile";
        renderUserOverview();
    }

    // 1. Render Admin Requests from LocalStorage
    function renderAdminRequests() {
        const bookingsTable = document.querySelector('tbody');
        const historyTable = document.getElementById('history-list-body');
        if(!bookingsTable) return;

        let bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        
        // Update Stats
        const totalReq = document.querySelector('#booking-tab h4:nth-of-type(1)');
        if(totalReq) totalReq.textContent = bookings.length;
        
        const activeProj = document.querySelectorAll('#booking-tab h4')[1];
        if(activeProj) activeProj.textContent = bookings.filter(b => b.status === 'accepted').length.toString().padStart(2, '0');

        // Current Requests (Pending/Accepted)
        const currentBookings = bookings.filter(b => b.status === 'pending' || b.status === 'accepted').reverse();
        if(currentBookings.length === 0) {
            bookingsTable.innerHTML = `<tr><td colspan="6" class="py-20 text-center font-bold opacity-30 uppercase tracking-widest text-xs">No active requests</td></tr>`;
        } else {
            bookingsTable.innerHTML = currentBookings.map(book => `
                <tr class="border-b border-gray-50 group hover:bg-gray-50/80 transition-all duration-300">
                    <td class="py-10 px-4">
                        <div class="flex flex-col">
                            <span class="font-bold text-sm text-[#1A1A1A] uppercase tracking-widest">${book.name}</span>
                            <span class="text-[9px] font-bold text-gray-400">${book.email} | ${book.phone || 'No Phone'}</span>
                            <span class="text-[9px] font-black text-[#C16053] uppercase">${book.social || 'No Social'}</span>
                        </div>
                    </td>
                    <td class="py-10 px-4">
                        <div class="flex flex-col items-center justify-center space-y-2">
                             <button onclick="viewAddress('${book.address || 'BGC, Taguig'}')" class="w-10 h-10 bg-[#C16053]/5 text-[#C16053] rounded-full flex items-center justify-center hover:bg-[#C16053] hover:text-white transition-all shadow-sm" title="View Meet-up Address">
                                 <i data-lucide="home" class="w-4 h-4"></i>
                             </button>
                             <span class="text-[8px] font-black uppercase text-gray-300 tracking-tighter truncate max-w-[60px]">${book.address || 'BGC'}</span>
                        </div>
                    </td>
                    <td class="py-10 px-4">
                        <div class="flex flex-col">
                            <span class="font-black italic text-[#C16053] capitalize">${book.medium}</span>
                            <span class="text-[9px] font-black uppercase text-gray-300 tracking-widest">${book.size || 'N/A'}</span>
                        </div>
                    </td>
                    <td class="py-10 px-4">
                        <button onclick="viewReferencePhoto('${book.reference}')" class="text-[9px] font-black uppercase tracking-[0.2em] px-5 py-3 bg-[#1A1A1A] text-white rounded-xl hover:bg-[#C16053] transition-all shadow-lg">
                            Open Photo
                        </button>
                    </td>
                    <td class="py-10 px-4">
                        <div class="flex flex-col space-y-2">
                            <span class="font-bold text-sm">₱${book.price || (book.medium === 'digital' ? '2,200' : '1,500')}</span>
                            <button onclick="viewPayment('${book.payment}')" class="text-[9px] uppercase font-black tracking-widest py-1 px-3 bg-[#1A1A1A] text-white rounded-md hover:bg-[#C16053] transition-colors w-fit tracking-[0.2em]">${book.payment}</button>
                        </div>
                    </td>
                    <td class="py-10 px-4 text-right">
                        <div class="flex justify-end space-x-3">
                            ${book.status === 'pending' ? `
                                <button onclick="updateBookingStatus(${book.id}, 'accepted')" class="p-4 bg-[#1A1A1A] text-white rounded-2xl hover:bg-green-600 transition-all group/btn">
                                    <i data-lucide="check" class="w-5 h-5"></i>
                                </button>
                                <button onclick="updateBookingStatus(${book.id}, 'declined')" class="p-4 border-2 border-gray-100 text-gray-300 rounded-2xl hover:border-red-500 hover:text-red-500 transition-all">
                                    <i data-lucide="x" class="w-5 h-5"></i>
                                </button>
                            ` : (book.status === 'accepted' ? `
                                <button onclick="updateBookingStatus(${book.id}, 'completed')" class="text-[9px] uppercase font-black tracking-widest py-3 px-6 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-lg italic">Complete</button>
                            ` : `<span class="text-[10px] font-black uppercase tracking-widest opacity-20 italic">Archived</span>`)}
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        // History Content (Declined/Completed)
        if(historyTable) {
            const historyBookings = bookings.filter(b => b.status === 'declined' || b.status === 'completed').reverse();
            if(historyBookings.length === 0) {
               historyTable.innerHTML = `<tr><td colspan="4" class="py-12 text-center font-bold opacity-30 uppercase text-[10px] tracking-widest">Archive empty</td></tr>`;
            } else {
                historyTable.innerHTML = historyBookings.map(book => `
                    <tr class="border-b border-gray-50 opacity-60">
                        <td class="py-8 px-4 font-bold uppercase tracking-widest text-[#1A1A1A]">${book.name}</td>
                        <td class="py-8 px-4 capitalize italic">${book.medium}</td>
                        <td class="py-8 px-4 text-gray-400">${book.date}</td>
                        <td class="py-8 px-4">
                            <span class="px-4 py-1 ${statusClass(book.status)} rounded-md text-[8px] font-black uppercase tracking-widest">${book.status}</span>
                        </td>
                    </tr>
                `).join('');
            }
        }
        lucide.createIcons();
    }

    function statusClass(status) {
        switch(status) {
            case 'pending': return 'bg-yellow-50 text-yellow-600 border border-yellow-100';
            case 'accepted': return 'bg-green-50 text-green-600 border border-green-100';
            case 'declined': return 'bg-red-50 text-red-600 border border-red-100';
            default: return 'bg-gray-50 text-gray-400';
        }
    }

    window.updateBookingStatus = (id, status) => {
        let bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        const index = bookings.findIndex(b => b.id === id);
        if(index !== -1) {
            bookings[index].status = status;
            localStorage.setItem('bookings', JSON.stringify(bookings));
            Swal.fire({
                icon: 'success',
                title: `Commission ${status.toUpperCase()}`,
                text: `Notification sent to client.`,
                confirmButtonColor: '#1A1A1A'
            }).then(() => renderAdminRequests());
        }
    };

    function renderUserOverview() {
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        const userEmail = localStorage.getItem('user_email') || storedName?.toLowerCase() + '@example.com';
        const userBookings = bookings.filter(b => b.email === userEmail || b.name.toUpperCase() === storedName?.toUpperCase());
        
        // Update User Stats
        const totalReq = document.querySelector('#booking-tab h4:nth-of-type(1)');
        if(totalReq) totalReq.textContent = userBookings.length;
        
        const activeProj = document.querySelectorAll('#booking-tab h4')[1];
        if(activeProj) activeProj.textContent = userBookings.filter(b => b.status === 'accepted').length.toString().padStart(2, '0');
    }

    // 4. Admin Meet-up Address Viewer (Dynamic Map with Leaflet Support)
    window.viewAddress = (adr) => {
        const isCoord = adr.includes('📍 Map Location:');
        let lat = 14.5492, lng = 121.0450; // Default BGC
        
        if(isCoord) {
            const coords = adr.split(': ')[1].split(', ');
            lat = parseFloat(coords[0]);
            lng = parseFloat(coords[1]);
        }

        const query = encodeURIComponent(adr || 'BGC, Taguig');
        const searchSrc = `https://maps.google.com/maps?q=${query}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

        Swal.fire({
            title: `<span class="text-xs font-black uppercase tracking-widest">Location: ${adr}</span>`,
            html: `
                <div id="admin-map-view" class="w-full h-80 rounded-2xl shadow-inner border border-gray-100"></div>
                <div class="mt-6">
                    <button onclick="window.open('https://www.google.com/maps/search/?api=1&query=${lat},${lng}', '_blank')" class="w-full bg-[#1A1A1A] text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center space-x-3 hover:bg-[#C16053] transition-all">
                        <i data-lucide="external-link" class="w-4 h-4"></i>
                        <span>Open Google Map</span>
                    </button>
                </div>
            `,
            didOpen: () => {
                const map = L.map('admin-map-view', {
                    zoomControl: false 
                }).setView([lat, lng], 16);
                
                L.control.zoom({ position: 'bottomright' }).addTo(map);

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
                L.marker([lat, lng]).addTo(map).bindPopup("<b>Client's Meeting Spot</b>").openPopup();
                setTimeout(() => map.invalidateSize(), 500);
            },
            confirmButtonColor: '#C16053',
            confirmButtonText: 'Done'
        });
    };

    // 5. Simulated Real-Time Updates (Auto-refresh on storage change)
    window.addEventListener('storage', (e) => {
        if(e.key === 'bookings') {
            console.log("Real-time Update: Syncing new requests...");
            renderAdminRequests();
        }
    });

    // 5. View GCash Receipt
    window.viewPayment = () => {
        Swal.fire({
            title: 'GCash Payment Receipt',
            text: 'Reference No: 9002 123 45678',
            imageUrl: 'https://images.unsplash.com/photo-1620216503946-63e800d984cf?q=80&w=1964&auto=format&fit=crop',
            imageWidth: 300,
            imageAlt: 'Mock Receipt',
            confirmButtonColor: '#1A1A1A'
        });
    };
});

// 6. Admin Gallery Actions
window.deleteImage = (btn) => {
    const card = btn.closest('.portrait-card');
    const artId = card.getAttribute('data-id');
    
    Swal.fire({
        title: 'Delete Artwork?',
        text: "This will permanently remove it from the public gallery.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#C16053',
        cancelButtonColor: '#1A1A1A',
        confirmButtonText: 'Yes, Delete'
    }).then((result) => {
        if (result.isConfirmed) {
            // Remove from State
            let artworks = JSON.parse(localStorage.getItem('gallery_data')) || [];
            artworks = artworks.filter(a => a.id != artId);
            localStorage.setItem('gallery_data', JSON.stringify(artworks));

            // Sync UI
            card.classList.add('scale-0', 'opacity-0');
            setTimeout(() => {
                renderGallery(); // Re-render both grids
            }, 500);
        }
    });
};

window.editImage = (btn) => {
    const card = btn.closest('.portrait-card');
    const artId = card.getAttribute('data-id');
    const title = card.querySelector('h4').textContent;
    const category = card.querySelector('p').textContent;
    const size = card.querySelector('.artwork-size').textContent;

    Swal.fire({
        title: 'Edit Artwork Details',
        html: `
            <style>
                .swal2-input { color: #1A1A1A !important; font-family: 'Outfit', sans-serif; font-size: 14px; margin: 10px auto; }
                .swal-label { font-size: 10px; font-weight: 900; text-transform: uppercase; color: #C16053; display: block; text-align: left; margin-left: 3rem; }
            </style>
            <label class="swal-label">Artwork Name</label>
            <input id="swal-title" class="swal2-input" value="${title}">
            
            <label class="swal-label">Media Category</label>
            <input id="swal-category" class="swal2-input" value="${category}">
            
            <label class="swal-label">Physical Size</label>
            <input id="swal-size" class="swal2-input" value="${size}">
        `,
        focusConfirm: false,
        confirmButtonColor: '#1A1A1A',
        preConfirm: () => {
            return [
                document.getElementById('swal-title').value,
                document.getElementById('swal-category').value,
                document.getElementById('swal-size').value
            ]
        }
    }).then((result) => {
        if (result.value) {
            // Update State
            let artworks = JSON.parse(localStorage.getItem('gallery_data')) || [];
            const index = artworks.findIndex(a => a.id == artId);
            if(index !== -1) {
                artworks[index].title = result.value[0];
                artworks[index].category = result.value[1];
                artworks[index].size = result.value[2];
                localStorage.setItem('gallery_data', JSON.stringify(artworks));
                
                renderGallery(); // Sync UI
                
                Swal.fire({
                    icon: 'success',
                    title: 'Updated!',
                    text: 'Changes are now live on the public gallery.',
                    confirmButtonColor: '#1A1A1A'
                });
            }
        }
    });
};

// 7. Add Artwork Modal
window.addArtworkModal = () => {
    Swal.fire({
        title: 'New Gallery Addition',
        html: `
            <style>
                .swal2-input { color: #1A1A1A !important; font-family: 'Outfit', sans-serif; font-size: 13px; margin: 8px auto; border-radius: 12px; border: 1px solid #eee; }
                .swal-label { font-size: 9px; font-weight: 900; text-transform: uppercase; color: #C16053; display: block; text-align: left; margin-left: 3rem; margin-top: 10px; tracking: 1px; }
                .file-info { font-size: 9px; color: #999; margin-left: 3rem; margin-top: 4px; }
            </style>
            <label class="swal-label">Artwork Title</label>
            <input id="add-title" class="swal2-input" placeholder="e.g. The Soulful Stroke">
            
            <label class="swal-label">Media Category / Description</label>
            <input id="add-category" class="swal2-input" placeholder="e.g. Charcoal on Vellum">
            
            <label class="swal-label">Standard Size</label>
            <input id="add-size" class="swal2-input" placeholder="e.g. 12x18 inches">
            
            <label class="swal-label">Artwork Image File</label>
            <input type="file" id="add-img-file" class="swal2-input" accept="image/*" style="padding-top: 10px;">
            <p class="file-info text-left">Upload your JPG/PNG reference</p>
        `,
        focusConfirm: false,
        confirmButtonColor: '#1A1A1A',
        confirmButtonText: 'Publish to Gallery',
        showCancelButton: true,
        cancelButtonText: 'Discard',
        preConfirm: async () => {
             const title = document.getElementById('add-title').value;
             const category = document.getElementById('add-category').value;
             const size = document.getElementById('add-size').value;
             const fileInput = document.getElementById('add-img-file');

             if(!title || !category || !fileInput.files[0]) {
                 Swal.showValidationMessage('Please fill in Required fields (Title, Category, Image File)');
                 return false;
             }

             // Convert File to Base64 (needed for localStorage storage)
             const readAsDataURL = (file) => {
                 return new Promise((resolve, reject) => {
                     const reader = new FileReader();
                     reader.onload = () => resolve(reader.result);
                     reader.onerror = reject;
                     reader.readAsDataURL(file);
                 });
             };

             try {
                const imgBase64 = await readAsDataURL(fileInput.files[0]);
                return { title, category, size, img: imgBase64 };
             } catch (err) {
                Swal.showValidationMessage('Error processing image file.');
                return false;
             }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const newArt = {
                id: Date.now(),
                ...result.value,
                fallback: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2071&auto=format&fit=crop'
            };

            // Update State
            let artworks = JSON.parse(localStorage.getItem('gallery_data')) || [];
            artworks.push(newArt);
            localStorage.setItem('gallery_data', JSON.stringify(artworks));

            renderGallery(); // Re-render everything

            Swal.fire({
                icon: 'success',
                title: 'Artwork Published!',
                text: 'Your new masterpiece is now live on the landing page.',
                confirmButtonColor: '#1A1A1A'
            });
        }
    });
};

// View Image Logic for Gallery
function viewImage(el) {
    if(window.event && (window.event.target.closest('button'))) return;
    const img = el.querySelector('img');
    const title = el.querySelector('h4').textContent;
    if(!img) return;

    Swal.fire({
        title: title,
        imageUrl: img.src,
        imageAlt: title,
        confirmButtonColor: '#1A1A1A',
        confirmButtonText: 'Return to Gallery'
    });
}

// Global View Reference Action
window.viewReferencePhoto = (imgData) => {
    if(!imgData || imgData === 'null' || imgData === 'undefined' || imgData === '') {
        Swal.fire({
            icon: 'info',
            title: 'No Reference Uploaded',
            text: 'This client did not provide a reference photo with their request.',
            confirmButtonColor: '#1A1A1A'
        });
        return;
    }

    Swal.fire({
        title: 'CLIENT REFERENCE PHOTO',
        imageUrl: imgData,
        imageAlt: 'Portrait Reference',
        confirmButtonColor: '#1A1A1A',
        confirmButtonText: 'Back to Requests',
        customClass: {
            image: 'rounded-[1.5rem] border-8 border-white/10 shadow-2xl'
        }
    });
}
