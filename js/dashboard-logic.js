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
        const totalReqEl = document.getElementById('total-requests-stat');
        const galleryCountEl = document.getElementById('gallery-count-stat');
        const revenueEl = document.getElementById('revenue-stat');

        if(totalReqEl) totalReqEl.textContent = bookings.length;
        
        if(galleryCountEl) {
            const gallery = JSON.parse(localStorage.getItem('gallery_data') || '[]');
            galleryCountEl.textContent = gallery.length.toString().padStart(2, '0');
        }
        
        if(revenueEl) {
            // Include accepted and completed in revenue
            const confirmed = bookings.filter(b => b.status === 'accepted' || b.status === 'completed');
            const total = confirmed.reduce((sum, b) => {
                // Handle various price formats (e.g. 1k, 500, etc)
                let priceStr = b.price?.replace(/[₱,]/g, '') || "0";
                let priceVal = 0;
                if(priceStr.toLowerCase().includes('k')) {
                    priceVal = parseFloat(priceStr.replace(/k/gi, '')) * 1000;
                } else {
                    priceVal = parseFloat(priceStr);
                }
                return sum + (isNaN(priceVal) ? 0 : priceVal);
            }, 0);
            
            revenueEl.textContent = total >= 1000 ? `₱${(total/1000).toFixed(1)}k` : `₱${total}`;
        }

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
                            <button onclick="viewPayment('${book.payment_receipt}', '${book.payment}')" class="text-[9px] uppercase font-black tracking-widest py-1 px-3 ${book.payment_receipt ? 'bg-green-600' : 'bg-[#1A1A1A]'} text-white rounded-md hover:bg-[#C16053] transition-colors w-fit tracking-[0.2em]">${book.payment}</button>
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
                    <tr class="border-b border-gray-50 opacity-60 hover:opacity-100 transition-opacity">
                        <td class="py-8 px-4 font-bold uppercase tracking-widest text-[#1A1A1A]">${book.name}</td>
                        <td class="py-8 px-4 capitalize italic">${book.medium}</td>
                        <td class="py-8 px-4 text-gray-400 font-bold uppercase tracking-tighter">${book.date}</td>
                        <td class="py-8 px-4">
                            <span class="px-4 py-1 ${statusClass(book.status)} rounded-md text-[8px] font-black uppercase tracking-widest">${book.status}</span>
                        </td>
                        <td class="py-8 px-4 text-right">
                             <button onclick="deleteHistoryEntry(${book.id})" class="p-2 text-red-500/30 hover:text-red-500 transition-colors">
                                 <i data-lucide="trash-2" class="w-4 h-4"></i>
                             </button>
                        </td>
                    </tr>
                `).join('');
            }
        }
        lucide.createIcons();
    }

    // Individual History Deletion
    window.deleteHistoryEntry = (id) => {
        let bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        const entry = bookings.find(b => b.id === id);
        
        Swal.fire({
            title: `Delete ${entry ? entry.name : 'Entry'}?`,
            text: 'This will permanently erase this record from the archive.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#C16053',
            cancelButtonColor: '#1A1A1A',
            confirmButtonText: 'Yes, Erase'
        }).then((result) => {
            if (result.isConfirmed) {
                bookings = bookings.filter(b => b.id !== id);
                localStorage.setItem('bookings', JSON.stringify(bookings));
                renderAdminRequests();
            }
        });
    };

    // Bulk Archive Clearance
    window.clearArchive = () => {
        Swal.fire({
            title: 'Wipe Archive?',
            text: 'This will permanently remove all completed and declined commissions.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#C16053',
            cancelButtonColor: '#1A1A1A',
            confirmButtonText: 'Yes, Clear'
        }).then((result) => {
            if (result.isConfirmed) {
                let bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
                // Keep only active (pending/accepted) ones
                bookings = bookings.filter(b => b.status === 'pending' || b.status === 'accepted');
                localStorage.setItem('bookings', JSON.stringify(bookings));
                renderAdminRequests();
                Swal.fire({
                    icon: 'success',
                    title: 'Archive Cleared',
                    confirmButtonColor: '#1A1A1A'
                });
            }
        });
    };

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
    window.viewPayment = (receiptData, method) => {
        if(method !== 'gcash' || !receiptData || receiptData === 'null' || receiptData === '') {
            Swal.fire({
                icon: 'info',
                title: 'No Digital Receipt',
                text: method === 'gcash' 
                    ? 'The client selected GCash but did not upload a screenshot.'
                    : 'This client selected Cash-on-Meetup. No digital receipt was provided.',
                confirmButtonColor: '#1A1A1A'
            });
            return;
        }

        Swal.fire({
            title: 'GCash Payment Receipt',
            html: '<p class="text-[9px] font-black uppercase tracking-[0.2em] mb-4 text-[#C16053]">Transaction Verification</p>',
            imageUrl: receiptData,
            imageWidth: '100%',
            imageAlt: 'GCash Receipt',
            confirmButtonColor: '#1A1A1A',
            confirmButtonText: 'Verify & Close',
            customClass: {
                image: 'rounded-3xl border-4 border-gray-100 shadow-2xl'
            }
        });
    };
});

// Synchronize Gallery Rendering
window.renderGallery = () => {
    const container = document.getElementById('admin-gallery-container');
    if(!container) return;

    let artworks = JSON.parse(localStorage.getItem('gallery_data') || '[]');
    
    if(artworks.length === 0) {
        container.innerHTML = `
            <div class="col-span-full py-32 text-center border-4 border-dashed border-gray-100/50">
                <i data-lucide="image-off" class="w-16 h-16 text-gray-200 mx-auto mb-4"></i>
                <p class="text-[10px] font-black uppercase text-gray-300 tracking-[0.3em]">No artworks in gallery</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    container.innerHTML = artworks.map(art => `
        <div class="portrait-card group w-full" data-id="${art.id}">
            <img src="${art.img}" alt="${art.title}" onerror="this.src='${art.fallback}'">
            
            <!-- Admin Controls -->
            <div class="absolute top-6 right-6 flex flex-col space-y-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-10 group-hover:translate-x-0 z-30">
                <button onclick="editImage(this)" class="w-12 h-12 bg-white/90 backdrop-blur-md text-[#1A1A1A] flex items-center justify-center hover:bg-[#1A1A1A] hover:text-white transition-all shadow-xl">
                    <i data-lucide="edit-3" class="w-5 h-5"></i>
                </button>
                <button onclick="deleteImage(this)" class="w-12 h-12 bg-white/90 backdrop-blur-md text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-xl">
                    <i data-lucide="trash-2" class="w-5 h-5"></i>
                </button>
            </div>

            <div class="overlay-info">
                <p class="text-[9px] uppercase font-black tracking-widest text-[#C16053] mb-2">${art.category}</p>
                <h4 class="text-xl font-black uppercase tracking-widest mb-4">${art.title}</h4>
                <div class="pt-4 border-t border-white/10 flex justify-between items-center">
                    <span class="text-[9px] font-bold uppercase tracking-widest opacity-60">Size: <span class="artwork-size">${art.size}</span></span>
                    <i data-lucide="maximize-2" class="w-4 h-4 text-white/40 cursor-pointer" onclick="viewImage(this.closest('.portrait-card'))"></i>
                </div>
            </div>
        </div>
    `).join('');

    lucide.createIcons();
};

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

// 7. Services Management Logic
window.previewServiceImage = (id) => {
    const file = document.getElementById(`service-${id}-file`).files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewEl = document.getElementById(`service-${id}-preview`);
            if(previewEl) previewEl.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
};

window.saveServices = async () => {
    try {
        const getBase64 = (file) => {
            return new Promise((resolve, reject) => {
                if(!file) resolve(null);
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        };

        Swal.fire({
            title: 'Updating Services...',
            text: 'Synchronizing your artistic categories...',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        const currentServices = JSON.parse(localStorage.getItem('services_data')) || [];
        const services = [];
        
        for(let i=1; i<=3; i++) {
            const fileInput = document.getElementById(`service-${i}-file`);
            const titleInput = document.getElementById(`service-${i}-title`);
            const descInput = document.getElementById(`service-${i}-desc`);
            
            if(!titleInput || !descInput) continue;

            const title = titleInput.value;
            const desc = descInput.value;
            
            let img = currentServices.find(s => s.id === i)?.img || "";
            
            if(!img) {
                const defaultMap = { 1: 'images/portrait_sample.png', 2: 'images/digital_art.png', 3: 'images/colored_art.png' };
                img = defaultMap[i];
            }

            if(fileInput && fileInput.files[0]) {
                const b64 = await getBase64(fileInput.files[0]);
                if(b64) img = b64;
            }
            
            services.push({ id: i, title, desc, img });
        }

        localStorage.setItem('services_data', JSON.stringify(services));

        await Swal.fire({
            icon: 'success',
            title: 'Sync Complete!',
            text: 'Your landing page highlights have been updated successfully.',
            confirmButtonColor: '#1A1A1A',
            timer: 2000,
            timerProgressBar: true
        });

        if(typeof loadServicesToForm === 'function') loadServicesToForm();

    } catch (error) {
        console.error("Save Error:", error);
        Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: error.name === 'QuotaExceededError' 
                ? 'Your images are too large for browser storage. Please try smaller files.' 
                : 'An unexpected error occurred while saving.',
            confirmButtonColor: '#C16053'
        });
    }
};

window.loadServicesToForm = () => {
    const defaultServices = [
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

    const services = JSON.parse(localStorage.getItem('services_data')) || defaultServices;

    services.forEach(service => {
        const titleInput = document.getElementById(`service-${service.id}-title`);
        const descInput = document.getElementById(`service-${service.id}-desc`);
        const previewImg = document.getElementById(`service-${service.id}-preview`);

        if(titleInput) titleInput.value = service.title;
        if(descInput) descInput.value = service.desc;
        if(previewImg) previewImg.src = service.img;
    });
};

// 8. Rates Management Logic
window.saveRates = () => {
    const rates = [];
    for(let i=1; i<=4; i++) {
        rates.push({
            id: i,
            size: document.getElementById(`rate-${i}-size`).value,
            label: document.getElementById(`rate-${i}-label`).value,
            price: document.getElementById(`rate-${i}-price`).value
        });
    }

    localStorage.setItem('rates_data', JSON.stringify(rates));

    Swal.fire({
        icon: 'success',
        title: 'Rates Updated!',
        text: 'Pricing tiers have been updated across the platform.',
        confirmButtonColor: '#1A1A1A'
    });
};

window.loadRatesToForm = () => {
    const defaultRates = [
        { id: 1, size: '6x8', label: 'Mini Portrait', price: '300 - 400' },
        { id: 2, size: '8.5x11', label: 'Letter Format', price: '400 - 700' },
        { id: 3, size: 'A4', label: 'Standard Size', price: '500 - 800' },
        { id: 4, size: '12x18', label: 'Large Scale', price: '1k - 1.5k' }
    ];

    const rates = JSON.parse(localStorage.getItem('rates_data')) || defaultRates;

    rates.forEach(rate => {
        const sizeInput = document.getElementById(`rate-${rate.id}-size`);
        const labelInput = document.getElementById(`rate-${rate.id}-label`);
        const priceInput = document.getElementById(`rate-${rate.id}-price`);

        if(sizeInput) sizeInput.value = rate.size;
        if(labelInput) labelInput.value = rate.label;
        if(priceInput) priceInput.value = rate.price;
    });
};

// 9. Change Password Logic
window.handlePasswordUpdate = (e) => {
    e.preventDefault();
    const current = document.getElementById('current-pass').value;
    const newP = document.getElementById('new-pass').value;
    const confirmP = document.getElementById('confirm-pass').value;
    
    // Check against stored password or default
    const storedPass = localStorage.getItem('admin_pass') || 'admin123';

    if(current !== storedPass) {
        Swal.fire({
            icon: 'error',
            title: 'Incorrect Passkey',
            text: 'Your current passkey does not match our records.',
            confirmButtonColor: '#C16053'
        });
        return;
    }

    if(newP !== confirmP) {
        Swal.fire({
            icon: 'error',
            title: 'Mismatch',
            text: 'New password and confirmation do not match.',
            confirmButtonColor: '#C16053'
        });
        return;
    }

    if(newP.length < 6) {
        Swal.fire({
            icon: 'warning',
            title: 'Security Notice',
            text: 'Please choose a stronger password (at least 6 characters).',
            confirmButtonColor: '#1A1A1A'
        });
        return;
    }

    // Save New Password
    localStorage.setItem('admin_pass', newP);

    Swal.fire({
        icon: 'success',
        title: 'Passkey Updated!',
        text: 'Your administrative security credentials have been changed successfully.',
        confirmButtonColor: '#1A1A1A'
    }).then(() => {
        // Clear inputs for security
        document.getElementById('current-pass').value = '';
        document.getElementById('new-pass').value = '';
        document.getElementById('confirm-pass').value = '';
    });
};

// 10. Intelligent Duplicate Cleanup
window.cleanDuplicates = () => {
    let bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    let initialCount = bookings.length;

    if(initialCount === 0) {
        Swal.fire({
            icon: 'info',
            title: 'Empty Records',
            text: 'There are no commissions to check for duplicates.',
            confirmButtonColor: '#1A1A1A'
        });
        return;
    }

    // Filter logic: Unique by name, email, and medium
    const seen = new Set();
    const uniqueBookings = bookings.filter(book => {
        const key = `${book.name.toLowerCase()}-${book.email.toLowerCase()}-${book.medium.toLowerCase()}`;
        if(seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });

    const duplicateCount = initialCount - uniqueBookings.length;

    if(duplicateCount === 0) {
        Swal.fire({
            icon: 'success',
            title: 'Data is Clean',
            text: 'No duplicate booking records were found.',
            confirmButtonColor: '#1A1A1A'
        });
        return;
    }

    Swal.fire({
        title: `Remove ${duplicateCount} Duplicates?`,
        text: `We found ${duplicateCount} redundant entries with matching credentials. Would you like to purge them?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#C16053',
        cancelButtonColor: '#1A1A1A',
        confirmButtonText: 'Yes, Purge'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.setItem('bookings', JSON.stringify(uniqueBookings));
            renderAdminRequests();
            if(typeof initStatsCharts === 'function') initStatsCharts(); // Update Charts
            
            Swal.fire({
                icon: 'success',
                title: 'Data Optimized',
                text: `${duplicateCount} duplicate entries have been successfully removed.`,
                confirmButtonColor: '#1A1A1A'
            });
        }
    });
};

// 11. Administrative Logout
window.logout = () => {
    Swal.fire({
        title: 'Sign Out?',
        text: 'You will need to re-authenticate to manage your commissions.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#C16053',
        cancelButtonColor: '#1A1A1A',
        confirmButtonText: 'Yes, Sign Out'
    }).then((result) => {
        if (result.isConfirmed) {
            // Clear Authentication State
            localStorage.removeItem('user_role');
            localStorage.removeItem('user_name');
            localStorage.removeItem('user_email');
            
            // Graceful Redirect
            window.location.href = 'index.html';
        }
    });
};
