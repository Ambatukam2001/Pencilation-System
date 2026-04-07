// Authentication Logic (Login/Signup)
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    // 1. Simulate Login
    if(loginForm) {
        loginForm.addEventListener('submit', async (e) => {
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

                try {
                    const res = await fetch(`${CONFIG.API_URL}/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password })
                    });

                    if (!res.ok) {
                        const err = await res.json().catch(() => ({}));
                        throw new Error(err.error || 'Authentication failed');
                    }
                    
                    const data = await res.json();
                    
                    // Success!
                    localStorage.setItem('user_name', data.username.toUpperCase());
                    localStorage.setItem('user_role', data.role);

                    // Always redirect via XAMPP (http://) so PHP is executed, not downloaded
                    const isLocal = window.location.protocol === 'file:' || 
                                    window.location.port === '5500' || 
                                    window.location.port === '5501';
                    const dashboardUrl = isLocal
                        ? 'http://localhost/Portrait%20Drawing/dashboard.php'
                        : window.location.origin + window.location.pathname.replace(/[^/]*$/, '') + 'dashboard.php';
                    
                    Swal.fire({
                            icon: 'success',
                            title: 'Admin Access Granted',
                            text: `Welcome back, ${data.username.toUpperCase()}!`,
                            confirmButtonColor: '#1A1A1A',
                            confirmButtonText: 'Enter Dashboard'
                    }).then(() => {
                            window.location.href = dashboardUrl;
                    });
                } catch(error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Access Denied',
                        text: error.message || 'Invalid Administrator Credentials.',
                        confirmButtonColor: '#C16053'
                    });
                }
            }
        });
    }

    // Signup functionalities have been removed as per Admin-only policy.
});
