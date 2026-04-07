<?php
// ============================================================
// Pencilation — File Upload Handler
// POST /api/upload
// Accepts: multipart/form-data with field 'file'
// Returns: { "path": "images/filename.jpg" }
// ============================================================

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// ── Config ──────────────────────────────────────────────────
$ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
$MAX_SIZE_MB   = 5;
$MAX_SIZE_BYTES = $MAX_SIZE_MB * 1024 * 1024;

// Upload destination — go up one level from /api/ to reach /images/
$UPLOAD_DIR = __DIR__ . '/../images/';

// ── Validate file exists ─────────────────────────────────────
if (!isset($_FILES['file']) || $_FILES['file']['error'] === UPLOAD_ERR_NO_FILE) {
    http_response_code(400);
    echo json_encode(['error' => 'No file received']);
    exit();
}

$file = $_FILES['file'];

// ── Validate upload error ────────────────────────────────────
if ($file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    $errors = [
        UPLOAD_ERR_INI_SIZE   => 'File exceeds server size limit',
        UPLOAD_ERR_FORM_SIZE  => 'File exceeds form size limit',
        UPLOAD_ERR_PARTIAL    => 'File was only partially uploaded',
        UPLOAD_ERR_NO_TMP_DIR => 'Missing temp folder',
        UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
        UPLOAD_ERR_EXTENSION  => 'Upload stopped by extension',
    ];
    echo json_encode(['error' => $errors[$file['error']] ?? 'Unknown upload error']);
    exit();
}

// ── Validate file size ───────────────────────────────────────
if ($file['size'] > $MAX_SIZE_BYTES) {
    http_response_code(400);
    echo json_encode(['error' => "File too large. Max {$MAX_SIZE_MB}MB allowed."]);
    exit();
}

// ── Validate MIME type (real check, not just extension) ──────
$finfo    = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->file($file['tmp_name']);

if (!in_array($mimeType, $ALLOWED_TYPES)) {
    http_response_code(400);
    echo json_encode(['error' => "Invalid file type: {$mimeType}. Only JPG, PNG, GIF, WEBP allowed."]);
    exit();
}

// ── Generate safe unique filename ───────────────────────────
$ext      = pathinfo($file['name'], PATHINFO_EXTENSION);
$safeName = preg_replace('/[^a-zA-Z0-9_-]/', '', pathinfo($file['name'], PATHINFO_FILENAME));
$safeName = substr($safeName, 0, 40); // truncate
$filename = $safeName . '_' . uniqid() . '.' . strtolower($ext);
$destPath = $UPLOAD_DIR . $filename;

// ── Ensure upload directory exists ──────────────────────────
if (!is_dir($UPLOAD_DIR)) {
    mkdir($UPLOAD_DIR, 0755, true);
}

// ── Move file to destination ─────────────────────────────────
if (!move_uploaded_file($file['tmp_name'], $destPath)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save file. Check folder permissions.']);
    exit();
}

// ── Success: return relative path ───────────────────────────
echo json_encode([
    'path'     => 'images/' . $filename,
    'filename' => $filename,
    'size'     => $file['size'],
    'type'     => $mimeType
]);
exit();
?>
