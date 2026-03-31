// Booking Form Logic
document.addEventListener('DOMContentLoaded', () => {
    const bookingForm = document.getElementById('booking-form');
    const detailedBookingForm = document.getElementById('detailed-booking-form');

    // 1. Landing Page Booking (Simple)
    if(bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(bookingForm);
            const fileInput = bookingForm.querySelector('input[type="file"]');
            let referenceImg = null;

            // Show Loading Immediately as processing image takes a sec
            Swal.fire({
                title: 'Processing Request...',
                text: 'Curating your commission details',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Convert Reference Photo to Base64
            if (fileInput && fileInput.files[0]) {
                const readAsDataURL = (file) => {
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    });
                };
                try {
                    referenceImg = await readAsDataURL(fileInput.files[0]);
                } catch (err) {
                    console.error("Reference photo error:", err);
                }
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
                payment: formData.get('payment'),
                reference: referenceImg, // New Field
                status: 'pending',
                date: new Date().toLocaleDateString()
            };

            // Store in Bookings Array
            let bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
            bookings.push(bookingData);
            localStorage.setItem('bookings', JSON.stringify(bookings));

            Swal.fire({
                icon: 'success',
                title: 'Commission Request Sent!',
                text: `Artist will contact you at ${bookingData.email} soon to finalize your ${bookingData.medium} portrait.`,
                confirmButtonColor: '#C16053',
                confirmButtonText: 'Got It'
            }).then(() => {
                bookingForm.reset();
            });
        });
    }

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
});
