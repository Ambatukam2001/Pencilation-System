<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/config/Database.php';

$database = new Database();
$db = $database->getConnection();
$db->exec("USE portrait_drawing_db");

$requestUri = isset($_GET['request']) ? $_GET['request'] : '';
$uriParts = explode('/', trim($requestUri, '/'));

$method = $_SERVER['REQUEST_METHOD'];
$body = json_decode(file_get_contents("php://input"), true) ?? [];

// Helper response function
function jsonResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

// Router
if ($uriParts[0] === 'bookings') {
    if ($method === 'POST') {
        require_once __DIR__ . '/controllers/BookingController.php';
        $controller = new BookingController($db);
        $controller->store($body);
    }
} elseif ($uriParts[0] === 'services') {
    if ($method === 'GET') {
        require_once __DIR__ . '/controllers/ServiceController.php';
        $controller = new ServiceController($db);
        $controller->index();
    }
} elseif ($uriParts[0] === 'rates') {
    if ($method === 'GET') {
        require_once __DIR__ . '/controllers/RateController.php';
        $controller = new RateController($db);
        $controller->index();
    }
} elseif ($uriParts[0] === 'artworks') {
    if ($method === 'GET') {
        require_once __DIR__ . '/controllers/ArtworkController.php';
        $controller = new ArtworkController($db);
        $controller->index();
    }
} elseif ($uriParts[0] === 'admin') {
    $resource = isset($uriParts[1]) ? $uriParts[1] : '';
    
    if ($resource === 'bookings') {
        require_once __DIR__ . '/controllers/BookingController.php';
        $controller = new BookingController($db);
        
        $action = isset($uriParts[2]) ? $uriParts[2] : '';
        
        if ($action === 'clear-archive' && $method === 'DELETE') {
            $controller->clearArchive();
        } elseif ($action === 'pending' && $method === 'GET') {
            $controller->pending();
        } elseif ($action !== '' && $method === 'PUT') {
            $controller->update($action, $body);
        } elseif ($action !== '' && $method === 'DELETE') {
            $controller->delete($action);
        } elseif ($method === 'GET') {
            $controller->index();
        }
    } elseif ($resource === 'services') {
        require_once __DIR__ . '/controllers/ServiceController.php';
        $controller = new ServiceController($db);
        $id = isset($uriParts[2]) ? $uriParts[2] : '';
        
        if ($method === 'GET') {
            $controller->index();
        } elseif ($method === 'PUT' && $id !== '') {
            $controller->update($id, $body);
        }
    } elseif ($resource === 'rates') {
        require_once __DIR__ . '/controllers/RateController.php';
        $controller = new RateController($db);
        $id = isset($uriParts[2]) ? $uriParts[2] : '';

        if ($method === 'GET') {
            $controller->index();
        } elseif ($method === 'PUT' && $id !== '') {
            $controller->update($id, $body);
        }
    } elseif ($resource === 'artworks') {
        require_once __DIR__ . '/controllers/ArtworkController.php';
        $controller = new ArtworkController($db);
        $id = isset($uriParts[2]) ? $uriParts[2] : '';

        if ($method === 'GET') {
            $controller->index();
        } elseif ($method === 'POST') {
            $controller->store($body);
        } elseif ($method === 'DELETE' && $id !== '') {
            $controller->delete($id);
        }
    }
} else {
    jsonResponse(["message" => "Endpoint not found"], 404);
}
?>
