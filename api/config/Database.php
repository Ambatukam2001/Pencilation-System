<?php
class Database {
    private $host = "localhost";
    private $db_name = "portrait_drawing_db";
    private $username = "root";
    private $password = "";
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch(PDOException $exception) {
            // Attempt to connect without DB if DB doesn't exist yet (for setup)
            try {
                $this->conn = new PDO("mysql:host=" . $this->host, $this->username, $this->password);
                $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            } catch(PDOException $ex) {
                echo json_encode(["error" => "Connection error: " . $exception->getMessage()]);
                exit;
            }
        }
        return $this->conn;
    }
}
?>
