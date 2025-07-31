<?php
// backend/logout.php
session_start();

// Unset all session variables
$_SESSION = array();

// Destroy the session
session_destroy();

// Redirect directly to the index page
header("Location: ../index.html"); // Adjust path if needed
exit(); // Essential to ensure no further output and the redirect happens immediately
?>