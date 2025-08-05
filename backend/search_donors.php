<?php
// backend/search_donors.php
session_start();
require_once 'config.php';

header('Content-Type: application/json');

$response = ['success' => false, 'message' => 'An unknown error occurred.', 'donors' => []];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $bloodType = trim($_POST['bloodType'] ?? '');
    $city = trim($_POST['city'] ?? '');

    try {
        // Updated SQL query to include the 56-day donation interval rule
        $sql = "SELECT id, full_name, phone, blood_type, city, address, last_donation_date FROM users WHERE 1=1";
        $params = [];

        // Condition to filter by last donation date (56 days ago or never)
        $sql .= " AND (last_donation_date IS NULL OR last_donation_date <= DATE_SUB(NOW(), INTERVAL 56 DAY))";

        if (!empty($bloodType)) {
            $sql .= " AND blood_type = ?";
            $params[] = $bloodType;
        }
        if (!empty($city)) {
            $sql .= " AND (city LIKE ? OR address LIKE ?)";
            $params[] = '%' . $city . '%';
            $params[] = '%' . $city . '%';
        }

        $sql .= " ORDER BY full_name ASC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $donors = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $response['success'] = true;
        $response['message'] = 'Donors retrieved successfully.';
        $response['donors'] = $donors;

    } catch (PDOException $e) {
        error_log("Donor search error: " . $e->getMessage());
        $response['message'] = 'Database error during donor search. Please try again later.';
    }
} else {
    $response['message'] = 'Invalid request method.';
}

echo json_encode($response);
exit();
?>