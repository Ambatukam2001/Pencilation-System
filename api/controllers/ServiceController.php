<?php
class ServiceController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    // GET /services or /admin/services — All services ordered by index
    public function index() {
        $stmt     = $this->db->query("SELECT id, title, description, image_url, order_index FROM services ORDER BY order_index ASC");
        $services = $stmt->fetchAll();
        jsonResponse($services);
    }

    // PUT /admin/services/{id} — Update a single service
    public function update($id, $data) {
        if (empty($data['title'])) {
            jsonResponse(['error' => 'Title is required'], 422);
            return;
        }

        // Truncate image_url if base64
        $imageUrl = $data['image_url'] ?? '';
        if (strlen($imageUrl) > 490) {
            $imageUrl = substr($imageUrl, 0, 490);
        }

        $sql  = "UPDATE services SET title = :title, description = :description, image_url = :image_url WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':title'       => trim($data['title']),
            ':description' => $data['description'] ?? '',
            ':image_url'   => $imageUrl,
            ':id'          => (int)$id
        ]);

        if ($stmt->rowCount() === 0) {
            jsonResponse(['error' => 'Service not found or no change made'], 404);
            return;
        }

        jsonResponse(['message' => 'Service updated successfully']);
    }
}
?>
