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

        // Ensure price is a valid numeric value
        $price = is_numeric($data['price']) ? (float)$data['price'] : 0.00;

        $sql  = "UPDATE rates SET size = :size, label = :label, price = :price WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':size'  => trim($data['size']),
            ':label' => $data['label'] ?? '',
            ':price' => $price,
            ':id'    => (int)$id
        ]);

        if ($stmt->rowCount() === 0) {
            jsonResponse(['error' => 'Rate not found or no change made'], 404);
            return;
        }

        jsonResponse(['message' => 'Rate updated successfully']);
    }
}
?>
