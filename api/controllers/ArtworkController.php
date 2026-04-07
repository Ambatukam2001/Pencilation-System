<?php
class ArtworkController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    // GET /artworks or /admin/artworks — All artworks
    public function index() {
        $stmt     = $this->db->query("SELECT id, title, category, size, image_url, is_featured, created_at FROM artworks ORDER BY created_at DESC");
        $artworks = $stmt->fetchAll();
        jsonResponse($artworks);
    }

    // POST /admin/artworks — Add a new artwork
    public function store($data) {
        if (empty($data['title'])) {
            jsonResponse(['error' => 'Title is required'], 422);
            return;
        }

        // Truncate base64 image if it exceeds varchar(500)
        $imageUrl = $data['image_url'] ?? '';
        if (strlen($imageUrl) > 490) {
            $imageUrl = substr($imageUrl, 0, 490);
        }

        $sql  = "INSERT INTO artworks (title, category, size, image_url, is_featured) VALUES (:title, :category, :size, :image_url, :is_featured)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':title'       => trim($data['title']),
            ':category'    => $data['category'] ?? '',
            ':size'        => $data['size'] ?? '',
            ':image_url'   => $imageUrl,
            ':is_featured' => $data['is_featured'] ?? 0
        ]);

        jsonResponse(['id' => $this->db->lastInsertId(), 'message' => 'Artwork published'], 201);
    }

    // PUT /admin/artworks/{id} — Update artwork metadata (title, category, size)
    public function update($id, $data) {
        $fields = [];
        $params = [':id' => (int)$id];

        if (isset($data['title'])) {
            $fields[] = 'title = :title';
            $params[':title'] = trim($data['title']);
        }
        if (isset($data['category'])) {
            $fields[] = 'category = :category';
            $params[':category'] = $data['category'];
        }
        if (isset($data['size'])) {
            $fields[] = 'size = :size';
            $params[':size'] = $data['size'];
        }

        if (empty($fields)) {
            jsonResponse(['error' => 'No fields to update'], 422);
            return;
        }

        $sql  = "UPDATE artworks SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        if ($stmt->rowCount() === 0) {
            jsonResponse(['error' => 'Artwork not found or no change made'], 404);
            return;
        }

        jsonResponse(['message' => 'Artwork updated successfully']);
    }

    // DELETE /admin/artworks/{id} — Remove artwork
    public function delete($id) {
        $sql  = "DELETE FROM artworks WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => (int)$id]);

        if ($stmt->rowCount() === 0) {
            jsonResponse(['error' => 'Artwork not found'], 404);
            return;
        }

        jsonResponse(['message' => 'Artwork deleted'], 200);
    }
}
?>
