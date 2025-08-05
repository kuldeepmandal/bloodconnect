<?php
// backend/get_dashboard_data.php
session_start();
require_once 'config.php';

header('Content-Type: application/json');

$response = ['success' => false, 'message' => 'An unknown error occurred.', 'bloodTypeCounts' => []];

try {
    // Query to count users by blood type
    $stmt = $pdo->prepare("SELECT blood_type, COUNT(*) AS count FROM users GROUP BY blood_type");
    $stmt->execute();
    $bloodTypeCounts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $response['success'] = true;
    $response['message'] = 'Dashboard data retrieved successfully.';
    $response['bloodTypeCounts'] = $bloodTypeCounts;

} catch (PDOException $e) {
    error_log("Dashboard data error: " . $e->getMessage());
    $response['message'] = 'Database error fetching dashboard data. Please try again later.';
}

echo json_encode($response);
exit();
?>