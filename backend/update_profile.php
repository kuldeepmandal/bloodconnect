<?php
// backend/update_profile.php
session_start();
require_once 'config.php';

header('Content-Type: application/json');

$response = ['success' => false, 'message' => 'An unknown error occurred.'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Check if user is logged in
    if (!isset($_SESSION['user_id'])) {
        $response['message'] = 'User not logged in. Please log in to update your profile.';
        echo json_encode($response);
        exit();
    }

    $userId = $_SESSION['user_id'];
    $fullName = trim($_POST['fullName'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $age = intval($_POST['age'] ?? 0);
    $bloodType = trim($_POST['bloodType'] ?? '');
    $city = trim($_POST['city'] ?? '');
    $address = trim($_POST['address'] ?? '');
    $lastDonationDate = trim($_POST['lastDonationDate'] ?? '');

    // Basic validation
    if (empty($fullName) || empty($email) || empty($phone) || empty($bloodType) || empty($city) || empty($address)) {
        $response['message'] = 'All required fields must be filled.';
        echo json_encode($response);
        exit();
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $response['message'] = 'Invalid email format.';
        echo json_encode($response);
        exit();
    }
    
    if ($age < 18 || $age > 65) {
        $response['message'] = 'Donor age must be between 18 and 65 years.';
        echo json_encode($response);
        exit();
    }

    // Set lastDonationDate to null if empty
    $lastDonationDate = !empty($lastDonationDate) ? $lastDonationDate : null;

    try {
        // Check if the new email already exists for a DIFFERENT user
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
        $stmt->execute([$email, $userId]);
        if ($stmt->fetch()) {
            $response['message'] = 'This email is already in use by another user.';
            echo json_encode($response);
            exit();
        }

        // Prepare and execute the UPDATE statement
        $stmt = $pdo->prepare("UPDATE users SET full_name = ?, email = ?, phone = ?, age = ?, blood_type = ?, city = ?, address = ?, last_donation_date = ? WHERE id = ?");
        
        $stmt->execute([
            $fullName, 
            $email, 
            $phone, 
            $age, 
            $bloodType, 
            $city, 
            $address, 
            $lastDonationDate,
            $userId
        ]);

        if ($stmt->rowCount() > 0) {
            $response['success'] = true;
            $response['message'] = 'Profile updated successfully!';
        } else {
            $response['success'] = true;
            $response['message'] = 'No changes detected in your profile.';
        }

    } catch (PDOException $e) {
        error_log("Profile update error: " . $e->getMessage());
        $response['message'] = 'Database error during profile update. Please try again later.';
    }
} else {
    $response['message'] = 'Invalid request method.';
}

echo json_encode($response);
exit();
?>