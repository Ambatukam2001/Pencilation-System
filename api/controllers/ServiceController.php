<?php
class ServiceController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function index() {
        $stmt = $this->db->query("SELECT * FROM services ORDER BY order_index ASC");
        $services = $stmt->fetchAll();
        jsonResponse($services);
    }

    public function update($id, $data) {
        $sql = "UPDATE services SET title = :title, description = :description, image_url = :image_url WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':title' => $data['title'] ?? '',
            ':description' => $data['description'] ?? '',
            ':image_url' => $data['image_url'] ?? '',
            ':id' => $id
        ]);
        jsonResponse(['message' => 'Service updated']);
    }
}
?>
