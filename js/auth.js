// Authentication Logic (Login/Signup)
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    // 1. Simulate Login
    if(loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;

            // Form Validation (Simple)
            if(username && password) {
                Swal.fire({
                    title: 'Verifying Credentials...',
                    html: 'Connecting to secure server',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                // Simulate Network Delay
                setTimeout(() => {
                    const storedPass = localStorage.getItem('admin_pass') || 'admin123';
                    
                    if(username.toLowerCase() === 'admin' && password === storedPass) { 
                        localStorage.setItem('user_name', 'ADEL');
                        localStorage.setItem('user_role', 'admin');
                        
                        Swal.fire({
                             icon: 'success',
                             title: 'Admin Access Granted',
                             text: 'Welcome back, ADEL!',
                             confirmButtonColor: '#1A1A1A',
                             confirmButtonText: 'Enter Dashboard'
                        }).then(() => {
                             window.location.href = 'dashboard.html?role=admin';
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Access Denied',
                            text: 'Invalid Administrator Credentials.',
                            confirmButtonColor: '#C16053'
                        });
                    }
                }, 1500);
            }
        });
    }

    // Signup functionalities have been removed as per Admin-only policy.
});
