<?php
class BookingController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    // GET /admin/bookings — All bookings ordered by latest
    public function index() {
        $stmt = $this->db->query("SELECT * FROM bookings ORDER BY created_at DESC");
        $bookings = $stmt->fetchAll();
        jsonResponse($bookings);
    }

    // GET /bookings/status/{email} — Get status of most recent active booking
    public function status($email) {
        if (empty($email)) {
            jsonResponse(['error' => 'Email is required'], 422);
            return;
        }

        $stmt = $this->db->prepare("SELECT * FROM bookings WHERE client_email = :email ORDER BY created_at DESC LIMIT 1");
        $stmt->execute([':email' => $email]);
        $booking = $stmt->fetch();

        if (!$booking) {
            jsonResponse(['status' => 'none'], 200);
            return;
        }

        jsonResponse($booking);
    }

    // POST /admin/bookings — Pending bookings only (legacy name check)

    // POST /bookings — Store new booking
    public function store($data) {
        // Validate required fields
        if (empty($data['client_name']) || empty($data['client_email']) || empty($data['medium'])) {
            jsonResponse(['error' => 'Missing required fields: client_name, client_email, medium'], 422);
            return;
        }

        // Sanitize and prepare deadline — convert empty string to NULL for DATE column
        $deadline     = !empty($data['deadline']) ? $data['deadline'] : null;
        $referenceUrl = $data['reference_url'] ?? null;
        $receiptUrl   = $data['receipt_url'] ?? null;

        try {
            $sql = "INSERT INTO bookings 
                        (client_name, client_email, client_phone, client_social, medium, size, address, deadline, payment_method, reference_url, receipt_url, status) 
                    VALUES 
                        (:client_name, :client_email, :client_phone, :client_social, :medium, :size, :address, :deadline, :payment_method, :reference_url, :receipt_url, 'pending')";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':client_name'     => trim($data['client_name']),
                ':client_email'    => trim($data['client_email']),
                ':client_phone'    => $data['client_phone'] ?? '',
                ':client_social'   => $data['client_social'] ?? '',
                ':medium'          => $data['medium'],
                ':size'            => $data['size'] ?? '',
                ':address'         => $data['address'] ?? '',
                ':deadline'        => $deadline,
                ':payment_method'  => $data['payment_method'] ?? '',
                ':reference_url'   => $referenceUrl,
                ':receipt_url'     => $receiptUrl
            ]);

            jsonResponse(['id' => $this->db->lastInsertId(), 'status' => 'pending', 'message' => 'Booking submitted successfully'], 201);
        } catch (PDOException $e) {
            // EXTREMELY IMPORTANT: Return the actual error to diagnose DB issues
            jsonResponse(['error' => 'Database Error: ' . $e->getMessage()], 500);
        }
    }

    // PUT /admin/bookings/{id} — Update booking status
    public function update($id, $data) {
        if (!isset($data['status'])) {
            jsonResponse(['error' => 'Status field is required'], 422);
            return;
        }

        $allowedStatuses = ['pending', 'accepted', 'completed', 'rejected'];
        if (!in_array($data['status'], $allowedStatuses)) {
            jsonResponse(['error' => 'Invalid status value'], 422);
            return;
        }

        $sql  = "UPDATE bookings SET status = :status WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':status' => $data['status'], ':id' => (int)$id]);

        // SUCCESS: Identical status is fine
        jsonResponse(['message' => 'Status updated to ' . $data['status']]);
    }

    // DELETE /admin/bookings/{id} — Delete a single booking
    public function delete($id) {
        $sql  = "DELETE FROM bookings WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => (int)$id]);

        if ($stmt->rowCount() === 0) {
            jsonResponse(['error' => 'Booking not found'], 404);
            return;
        }

        jsonResponse(['message' => 'Booking deleted'], 200);
    }

    // DELETE /admin/bookings/clear-archive — Wipe completed/rejected records
    public function clearArchive() {
        $sql = "DELETE FROM bookings WHERE status IN ('completed', 'rejected')";
        $this->db->query($sql);
        jsonResponse(['message' => 'Archive cleared successfully']);
    }
}
?>
