-- phpMyAdmin SQL Dump
-- Fixed Version: Corrected data types, added foreign keys, improved schema

CREATE DATABASE IF NOT EXISTS `portrait_drawing_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `portrait_drawing_db`;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";
SET FOREIGN_KEY_CHECKS = 0;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- --------------------------------------------------------
-- Drop tables in reverse dependency order (safe re-import)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `bookings`;
DROP TABLE IF EXISTS `artworks`;
DROP TABLE IF EXISTS `rates`;
DROP TABLE IF EXISTS `services`;

-- --------------------------------------------------------
-- Table structure for `services`
-- --------------------------------------------------------
CREATE TABLE `services` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,       -- FIX: was longtext; varchar(500) is sufficient for paths/URLs
  `order_index` int(11) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `services` (`id`, `title`, `description`, `image_url`, `order_index`) VALUES
(1, 'Graphite Portrait',    'Fine-texture monochrome pencil art.',        'images/adel.JPG',        1),
(2, 'Colored Drawing Art',  'Vibrant colored pencil portraits.',          'images/colored.jpg',     2),
(3, 'Digital Masterpiece',  'Clean and modern digital illustrations.',    'images/digital_art.png', 3);

-- --------------------------------------------------------
-- Table structure for `rates`
-- --------------------------------------------------------
CREATE TABLE `rates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `size` varchar(255) NOT NULL,
  `label` varchar(255) DEFAULT NULL,
  `price` DECIMAL(10,2) DEFAULT 0.00,          -- FIX: was varchar(255); DECIMAL is correct for currency
  `order_index` int(11) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `rates` (`id`, `size`, `label`, `price`, `order_index`) VALUES
(1, '8.5 x 11',  'Standard Letter',   500.00,  1),
(2, '9 x 12',    'Artist Choice',     750.00,  2),
(3, '11 x 14',   'Premium Large',    1200.00,  3),
(4, '12 x 18',   'Exhibition Size',  2000.00,  4);

-- --------------------------------------------------------
-- Table structure for `artworks`
-- --------------------------------------------------------
CREATE TABLE `artworks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `category` varchar(255) DEFAULT NULL,
  `size` varchar(255) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,       -- FIX: was longtext; varchar(500) is sufficient for paths/URLs
  `is_featured` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `artworks` (`id`, `title`, `category`, `size`, `image_url`, `is_featured`, `created_at`) VALUES
(1, 'Graceful Glance', 'Graphite', '9x12 inches', 'images/portrait_sample.png', 1, '2026-04-06 14:00:01');

-- --------------------------------------------------------
-- Table structure for `bookings`
-- --------------------------------------------------------
CREATE TABLE `bookings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_name` varchar(255) NOT NULL,
  `client_email` varchar(255) NOT NULL,
  `client_phone` varchar(50) DEFAULT '',       -- FIX: was varchar(255); phone numbers don't need that length
  `client_social` varchar(255) DEFAULT '',
  `service_id` int(11) DEFAULT NULL,           -- FIX: replaces free-text `medium`; links to services table
  `medium` varchar(255) NOT NULL,              -- KEPT: for backward compatibility / display label
  `size` varchar(255) DEFAULT '',
  `address` text DEFAULT NULL,
  `deadline` DATE DEFAULT NULL,                -- FIX: was varchar(255); DATE type enables proper queries
  `payment_method` varchar(100) DEFAULT '',    -- FIX: was varchar(255); shorter is sufficient
  `reference_url` varchar(500) DEFAULT NULL,   -- FIX: was longtext; varchar(500) is sufficient for paths/URLs
  `receipt_url` varchar(500) DEFAULT NULL,     -- FIX: was longtext; varchar(500) is sufficient for paths/URLs
  `status` enum('pending','accepted','completed','rejected') DEFAULT 'pending',
  `live_status` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_bookings_service`
    FOREIGN KEY (`service_id`) REFERENCES `services` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE    -- FIX: added FK linking bookings to services for data integrity
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `bookings` (
  `id`, `client_name`, `client_email`, `client_phone`, `client_social`,
  `service_id`, `medium`, `size`, `address`, `deadline`,
  `payment_method`, `reference_url`, `receipt_url`,
  `status`, `live_status`, `created_at`, `updated_at`
) VALUES (
  1, 'PHP Test', 'test@example.com', '', '',
  NULL, 'pencil', '', '', NULL,
  'cash-in', '', '',
  'pending', 0, '2026-04-06 14:04:27', '2026-04-06 14:04:27'
);

SET FOREIGN_KEY_CHECKS = 1;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;