<?php
class BookingController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function index() {
        $stmt = $this->db->query("SELECT * FROM bookings ORDER BY created_at DESC");
        $bookings = $stmt->fetchAll();
        jsonResponse($bookings);
    }

    public function pending() {
        $stmt = $this->db->query("SELECT * FROM bookings WHERE status = 'pending' ORDER BY created_at DESC");
        $bookings = $stmt->fetchAll();
        jsonResponse($bookings);
    }

    public function store($data) {
        if (empty($data['client_name']) || empty($data['client_email']) || empty($data['medium'])) {
            jsonResponse(['error' => 'Missing required fields'], 422);
            return;
        }

        $sql = "INSERT INTO bookings (client_name, client_email, client_phone, client_social, medium, size, address, deadline, payment_method, reference_url, receipt_url, status) VALUES (:client_name, :client_email, :client_phone, :client_social, :medium, :size, :address, :deadline, :payment_method, :reference_url, :receipt_url, 'pending')";
        $stmt = $this->db->prepare($sql);
        
        $stmt->execute([
            ':client_name' => $data['client_name'],
            ':client_email' => $data['client_email'],
            ':client_phone' => $data['client_phone'] ?? '',
            ':client_social' => $data['client_social'] ?? '',
            ':medium' => $data['medium'],
            ':size' => $data['size'] ?? '',
            ':address' => $data['address'] ?? '',
            ':deadline' => $data['deadline'] ?? '',
            ':payment_method' => $data['payment_method'] ?? '',
            ':reference_url' => $data['reference_url'] ?? '',
            ':receipt_url' => $data['receipt_url'] ?? ''
        ]);

        $data['id'] = $this->db->lastInsertId();
        $data['status'] = 'pending';
        jsonResponse($data, 201);
    }

    public function update($id, $data) {
        if (!isset($data['status'])) {
            jsonResponse(['error' => 'Status is required'], 422);
            return;
        }

        $sql = "UPDATE bookings SET status = :status WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':status' => $data['status'], ':id' => $id]);
        
        jsonResponse(['message' => 'Status updated']);
    }

    public function delete($id) {
        $sql = "DELETE FROM bookings WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        
        jsonResponse(null, 204);
    }

    public function clearArchive() {
        $sql = "DELETE FROM bookings WHERE status IN ('completed', 'rejected', 'declined')";
        $this->db->query($sql);
        
        jsonResponse(['message' => 'Archive cleared successfully']);
    }
}
?>
