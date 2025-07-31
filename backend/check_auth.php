<?php
// backend/check_auth.php
session_start();
header('Content-Type: application/json');

// Always return true for 'authenticated' status, as per request to remove verification
$response = ['authenticated' => true];

// Session variables for user_id can still be set by login.php
// but this file will not force a redirect based on their presence.
// if (isset($_SESSION['authenticated']) && $_SESSION['authenticated'] === true) {
//     $response['authenticated'] = true;
// }

echo json_encode($response);
?>