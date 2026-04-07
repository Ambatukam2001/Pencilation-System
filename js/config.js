// ============================================================
// PENCILATION — Global Configuration
// ============================================================
const CONFIG = (() => {
    const port = window.location.port;
    // VS Code Live Server runs on 5500/5501 — redirect API calls to XAMPP
    const isLiveServer = port === '5500' || port === '5501';
    const host = window.location.hostname;
    const isFileProtocol = window.location.protocol === 'file:';
    const base = isLiveServer || isFileProtocol
        ? `http://localhost/Portrait Drawing` // Force localhost routing for local files and Live Server without explicit IP
        : (window.location.pathname.includes('/') ? window.location.pathname.split('/').slice(0, -1).join('/') || '' : '');

    return {
        // JSON API router (GET/POST/PUT/DELETE)
        API_URL:    base + '/api',
        // Direct upload endpoint — bypasses router (multipart/form-data)
        UPLOAD_URL: base + '/api/upload.php',
    };
})();
window.CONFIG = CONFIG;

// Utility to build correct image URL whether served from XAMPP or Live Server
window.buildImgUrl = (path) => {
    if (!path) return 'images/portrait_sample.png';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    
    const port = window.location.port;
    if (port === '5500' || port === '5501') {
        return `http://localhost/Portrait Drawing/${path}`;
    }
    return path;
};

