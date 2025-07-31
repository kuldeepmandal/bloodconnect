<?php
// backend/config.php

define('DB_HOST', 'localhost'); // Your database host
define('DB_NAME', 'bloodconnect_db'); // Your database name
define('DB_USER', 'root'); // Your database username
define('DB_PASS', ''); // Your database password (leave empty if no password)

try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME, DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}
?>