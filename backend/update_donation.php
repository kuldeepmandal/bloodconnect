<?php
// backend/update_donation.php
session_start();
require_once 'config.php';

header('Content-Type: application/json');

$response = ['success' => false, 'message' => 'An unknown error occurred.'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Check if user is logged in
    if (!isset($_SESSION['user_id'])) {
        $response['message'] = 'User not logged in. Please log in to update your donation date.';
        echo json_encode($response);
        exit();
    }

    $userId = $_SESSION['user_id'];
    $lastDonationDate = trim($_POST['lastDonationDate'] ?? '');

    // Validate input date
    if (empty($lastDonationDate)) {
        $response['message'] = 'Last Donation Date is required.';
        echo json_encode($response);
        exit();
    }

    // Basic date format validation (YYYY-MM-DD)
    if (!preg_match("/^\d{4}-\d{2}-\d{2}$/", $lastDonationDate)) {
        $response['message'] = 'Invalid date format. Please use YYYY-MM-DD.';
        echo json_encode($response);
        exit();
    }

    try {
        // Prepare UPDATE statement
        $stmt = $pdo->prepare("UPDATE users SET last_donation_date = ? WHERE id = ?");
        $stmt->execute([$lastDonationDate, $userId]);

        // Check if any rows were affected (meaning the update happened)
        if ($stmt->rowCount() > 0) {
            $response['success'] = true;
            $response['message'] = 'Last donation date updated successfully!';
        } else {
            // This might happen if the date is the same or user ID is invalid
            $response['message'] = 'No changes made or user not found. Date might be already updated or invalid user.';
            // For debugging, you could log: error_log("Update donation - No rows affected for user_id: " . $userId);
        }

    } catch (PDOException $e) {
        error_log("Database error updating donation date: " . $e->getMessage());
        $response['message'] = 'Database error updating donation date. Please try again later.';
    }
} else {
    $response['message'] = 'Invalid request method.';
}

echo json_encode($response);
exit();
?>