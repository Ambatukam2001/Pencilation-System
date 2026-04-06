<?php
class RateController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function index() {
        $stmt = $this->db->query("SELECT * FROM rates ORDER BY order_index ASC");
        $rates = $stmt->fetchAll();
        jsonResponse($rates);
    }

    public function update($id, $data) {
        $sql = "UPDATE rates SET size = :size, label = :label, price = :price WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':size' => $data['size'] ?? '',
            ':label' => $data['label'] ?? '',
            ':price' => $data['price'] ?? 0,
            ':id' => $id
        ]);
        jsonResponse(['message' => 'Rate updated']);
    }
}
?>
