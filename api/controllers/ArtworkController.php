<?php
class ArtworkController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function index() {
        $stmt = $this->db->query("SELECT * FROM artworks ORDER BY created_at DESC");
        $artworks = $stmt->fetchAll();
        jsonResponse($artworks);
    }

    public function store($data) {
        $sql = "INSERT INTO artworks (title, category, size, image_url, is_featured) VALUES (:title, :category, :size, :image_url, :is_featured)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':title' => $data['title'] ?? '',
            ':category' => $data['category'] ?? '',
            ':size' => $data['size'] ?? '',
            ':image_url' => $data['image_url'] ?? '',
            ':is_featured' => $data['is_featured'] ?? 0
        ]);
        $data['id'] = $this->db->lastInsertId();
        jsonResponse($data, 201);
    }

    public function delete($id) {
        $sql = "DELETE FROM artworks WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        jsonResponse(null, 204);
    }
}
?>
