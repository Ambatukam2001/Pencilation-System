<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/config/Database.php';

$database = new Database();
$db = $database->getConnection();

// Parse  request URI from rewrite rule
$requestUri = isset($_GET['request']) ? $_GET['request'] : '';
$uriParts   = explode('/', trim($requestUri, '/'));
$method     = $_SERVER['REQUEST_METHOD'];
$body       = json_decode(file_get_contents("php://input"), true) ?? [];

// --- Helper: Send JSON response ---
function jsonResponse($data, $status = 200) {
    http_response_code($status);
    if ($data === null) {
        echo json_encode(['message' => 'Success']);
    } else {
        echo json_encode($data);
    }
    exit;
}

// --- Router ---
$resource = $uriParts[0] ?? '';

if ($resource === 'upload') {
    // POST /upload — File upload handler (multipart/form-data)
    if ($method === 'POST') {
        // Delegate to dedicated upload handler (needs $_FILES access)
        require_once __DIR__ . '/upload.php';
    } else {
        jsonResponse(['error' => 'Method not allowed'], 405);
    }

} elseif ($resource === 'bookings') {
    // POST /bookings — Public booking submission
    if ($method === 'POST') {
        require_once __DIR__ . '/controllers/BookingController.php';
        (new BookingController($db))->store($body);
    } else {
        jsonResponse(['error' => 'Method not allowed'], 405);
    }

} elseif ($resource === 'services') {
    // GET /services — Public services list
    if ($method === 'GET') {
        require_once __DIR__ . '/controllers/ServiceController.php';
        (new ServiceController($db))->index();
    } else {
        jsonResponse(['error' => 'Method not allowed'], 405);
    }

} elseif ($resource === 'rates') {
    // GET /rates — Public rates list
    if ($method === 'GET') {
        require_once __DIR__ . '/controllers/RateController.php';
        (new RateController($db))->index();
    } else {
        jsonResponse(['error' => 'Method not allowed'], 405);
    }

} elseif ($resource === 'artworks') {
    // GET /artworks — Public gallery list
    if ($method === 'GET') {
        require_once __DIR__ . '/controllers/ArtworkController.php';
        (new ArtworkController($db))->index();
    } else {
        jsonResponse(['error' => 'Method not allowed'], 405);
    }

} elseif ($resource === 'admin') {
    $subResource = $uriParts[1] ?? '';
    $id          = $uriParts[2] ?? '';

    // --- /admin/bookings ---
    if ($subResource === 'bookings') {
        require_once __DIR__ . '/controllers/BookingController.php';
        $ctrl = new BookingController($db);

        if ($id === 'clear-archive' && $method === 'DELETE') {
            $ctrl->clearArchive();
        } elseif ($id !== '' && $method === 'PUT') {
            $ctrl->update($id, $body);
        } elseif ($id !== '' && $method === 'DELETE') {
            $ctrl->delete($id);
        } elseif ($method === 'GET') {
            $ctrl->index();
        } else {
            jsonResponse(['error' => 'Method not allowed'], 405);
        }

    // --- /admin/services ---
    } elseif ($subResource === 'services') {
        require_once __DIR__ . '/controllers/ServiceController.php';
        $ctrl = new ServiceController($db);

        if ($method === 'GET') {
            $ctrl->index();
        } elseif ($method === 'PUT' && $id !== '') {
            $ctrl->update($id, $body);
        } else {
            jsonResponse(['error' => 'Method not allowed'], 405);
        }

    // --- /admin/rates ---
    } elseif ($subResource === 'rates') {
        require_once __DIR__ . '/controllers/RateController.php';
        $ctrl = new RateController($db);

        if ($method === 'GET') {
            $ctrl->index();
        } elseif ($method === 'PUT' && $id !== '') {
            $ctrl->update($id, $body);
        } else {
            jsonResponse(['error' => 'Method not allowed'], 405);
        }

    // --- /admin/artworks ---
    } elseif ($subResource === 'artworks') {
        require_once __DIR__ . '/controllers/ArtworkController.php';
        $ctrl = new ArtworkController($db);

        if ($method === 'GET') {
            $ctrl->index();
        } elseif ($method === 'POST') {
            $ctrl->store($body);
        } elseif ($method === 'PUT' && $id !== '') {
            // FIX: Was missing — now correctly handles editImage() from dashboard
            $ctrl->update($id, $body);
        } elseif ($method === 'DELETE' && $id !== '') {
            $ctrl->delete($id);
        } else {
            jsonResponse(['error' => 'Method not allowed'], 405);
        }

    } else {
        jsonResponse(['error' => 'Admin resource not found'], 404);
    }

} else {
    jsonResponse(['error' => 'Endpoint not found'], 404);
}
?>
