<?php
require_once __DIR__ . '/config/Database.php';

$database = new Database();
$db = $database->getConnection();

try {
    // Create DB if not exists
    $db->exec("CREATE DATABASE IF NOT EXISTS portrait_drawing_db");
    $db->exec("USE portrait_drawing_db");

    // Bookings Table
    $db->exec("CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_name VARCHAR(255) NOT NULL,
        client_email VARCHAR(255) NOT NULL,
        client_phone VARCHAR(255) DEFAULT '',
        client_social VARCHAR(255) DEFAULT '',
        medium VARCHAR(255) NOT NULL,
        size VARCHAR(255) DEFAULT '',
        address TEXT,
        deadline VARCHAR(255) DEFAULT '',
        payment_method VARCHAR(255) DEFAULT '',
        reference_url LONGTEXT,
        receipt_url LONGTEXT,
        status ENUM('pending', 'accepted', 'completed', 'rejected') DEFAULT 'pending',
        live_status BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )");

    // Services Table
    $db->exec("CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image_url LONGTEXT,
        order_index INT DEFAULT 0
    )");

    // Rates Table
    $db->exec("CREATE TABLE IF NOT EXISTS rates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        size VARCHAR(255) NOT NULL,
        label VARCHAR(255),
        price VARCHAR(255),
        order_index INT DEFAULT 0
    )");

    // Artworks Table
    $db->exec("CREATE TABLE IF NOT EXISTS artworks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(255),
        size VARCHAR(255),
        image_url LONGTEXT,
        is_featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // Seed Data if empty
    $serviceCount = $db->query("SELECT COUNT(*) FROM services")->fetchColumn();
    if ($serviceCount == 0) {
        $db->exec("INSERT INTO services (title, description, image_url, order_index) VALUES 
            ('Graphite Portrait', 'Fine-texture monochrome pencil art.', 'images/adel.JPG', 1),
            ('Colored Drawing Art', 'Vibrant colored pencil portraits.', 'images/colored.jpg', 2),
            ('Digital Masterpiece', 'Clean and modern digital illustrations.', 'images/digital_art.png', 3)
        ");
    }

    $rateCount = $db->query("SELECT COUNT(*) FROM rates")->fetchColumn();
    if ($rateCount == 0) {
        $db->exec("INSERT INTO rates (size, label, price, order_index) VALUES 
            ('8.5 x 11', 'Standard Letter', 500, 1),
            ('9 x 12', 'Artist Choice', 750, 2),
            ('11 x 14', 'Premium Large', 1200, 3),
            ('12 x 18', 'Exhibition Size', 2000, 4)
        ");
    }

    $artworkCount = $db->query("SELECT COUNT(*) FROM artworks")->fetchColumn();
    if ($artworkCount == 0) {
        $db->exec("INSERT INTO artworks (title, category, size, image_url, is_featured) VALUES 
            ('Graceful Glance', 'Graphite', '9x12 inches', 'images/portrait_sample.png', 1)
        ");
    }

    echo "Database setup completed successfully.";
} catch (PDOException $e) {
    echo "Setup Error: " . $e->getMessage();
}
?>
