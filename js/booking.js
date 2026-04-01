// Booking Form Logic
document.addEventListener('DOMContentLoaded', () => {
    const bookingForm = document.getElementById('booking-form');
    const detailedBookingForm = document.getElementById('detailed-booking-form');

    // 1. Landing Page Booking (Simple)
    if(bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(bookingForm);
            const fileInput = bookingForm.querySelector('input[name="file"]');
            const receiptInput = document.getElementById('gcash-receipt-file');
            const paymentType = formData.get('payment');
            
            // Check for Receipt if GCash
            if(paymentType === 'gcash' && (!receiptInput || !receiptInput.files[0])) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Proof of Payment Required',
                    text: 'Please upload your GCash receipt screenshot to proceed.',
                    confirmButtonColor: '#C16053'
                });
                return;
            }

            let referenceImg = null;
            let receiptImg = null;

            // Show Loading
            Swal.fire({
                title: 'Processing Request...',
                text: 'Curating your commission details and verifying payment...',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); }
            });

            const getB64 = (file) => {
                return new Promise((resolve, reject) => {
                    if(!file) resolve(null);
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            };

            try {
                if (fileInput && fileInput.files[0]) referenceImg = await getB64(fileInput.files[0]);
                if (paymentType === 'gcash' && receiptInput && receiptInput.files[0]) {
                    receiptImg = await getB64(receiptInput.files[0]);
                }
            } catch (err) {
                console.error("Image processing error:", err);
            }

            const bookingData = {
                id: Date.now(),
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                social: formData.get('social'),
                medium: formData.get('medium'),
                size: formData.get('size'),
                address: formData.get('address'),
                deadline: formData.get('deadline'),
                payment: paymentType,
                reference: referenceImg,
                payment_receipt: receiptImg, // New Field
                status: 'pending',
                date: new Date().toLocaleDateString()
            };

            let bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
            bookings.push(bookingData);
            localStorage.setItem('bookings', JSON.stringify(bookings));

            Swal.fire({
                icon: 'success',
                title: 'Commission Request Sent!',
                text: `Request sent. Artist will contact you at ${bookingData.email} after verifying the payment.`,
                confirmButtonColor: '#C16053'
            }).then(() => {
                bookingForm.reset();
                if(typeof toggleGCashReceipt === 'function') toggleGCashReceipt(bookingForm.querySelector('select[name="payment"]'));
            });
        });
    }

    // 2. Conditional Payment Logic
    window.toggleGCashReceipt = (el) => {
        const wrapper = document.getElementById('gcash-receipt-wrapper');
        const input = document.getElementById('gcash-receipt-file');
        if(!wrapper) return;

        if(el.value === 'gcash') {
            wrapper.classList.remove('hidden');
            if(input) input.required = true;
        } else {
            wrapper.classList.add('hidden');
            if(input) input.required = false;
        }
    };

    window.updateFilename = (inputId, targetId) => {
        const input = document.getElementById(inputId);
        const target = document.getElementById(targetId);
        if(input && input.files[0]) {
            target.textContent = `Attached: ${input.files[0].name.substring(0, 20)}...`;
            target.parentElement.classList.add('bg-green-50', 'border-green-200', 'opacity-100');
        }
    };

    // Initialize Visibility
    const paySelect = document.querySelector('select[name="payment"]');
    if(paySelect) toggleGCashReceipt(paySelect);

    // 2. Dashboard Detailed Booking (Admin/User Features Simulator)
    if(detailedBookingForm) {
        detailedBookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const payment = e.target.payment.value;
            const deadline = e.target.querySelector('input[type="date"]').value;

            if(!deadline) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Invalid Deadline',
                    text: 'Please select a preferred date for completion.',
                    confirmButtonColor: '#C16053'
                });
                return;
            }

            Swal.fire({
                icon: 'question',
                title: 'Confirm Booking?',
                text: `Method: ${payment.toUpperCase()} | Deadline: ${deadline}`,
                showCancelButton: true,
                confirmButtonText: 'Submit Order',
                confirmButtonColor: '#1A1A1A',
                cancelButtonColor: '#C16053'
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Booking Confirmed!',
                        text: 'Your order is now in the artist queue. Track it in your bookings tab.',
                        confirmButtonColor: '#1A1A1A'
                    }).then(() => {
                        window.location.reload();
                    });
                }
            });
        });
    }

    // 3. Booking Map Logic (Leaflet)
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
