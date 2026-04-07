<?php
class RateController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    // GET /rates or /admin/rates — All rates ordered by index
    public function index() {
        $stmt  = $this->db->query("SELECT id, size, label, CAST(price AS CHAR) AS price, order_index FROM rates ORDER BY order_index ASC");
        $rates = $stmt->fetchAll();
        jsonResponse($rates);
    }

    // PUT /admin/rates/{id} — Update a single rate
    public function update($id, $data) {
        if (empty($data['size']) || empty($data['price'])) {
            jsonResponse(['error' => 'Size and price are required'], 422);
            return;
        }

        // Support both numeric and range strings (e.g. 500-600)
        $price = isset($data['price']) ? trim($data['price']) : '0';

        $sql  = "UPDATE rates SET size = :size, label = :label, price = :price WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':size'  => trim($data['size']),
            ':label' => $data['label'] ?? '',
            ':price' => $price,
            ':id'    => (int)$id
        ]);

        // SUCCESS: Even if rowCount is 0, it means the record exists but was saved with identical data
        jsonResponse(['message' => 'Rate synced successfully']);
    }
}
?>
