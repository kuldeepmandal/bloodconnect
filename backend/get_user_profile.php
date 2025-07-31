<?php
// backend/get_user_profile.php
session_start();
require_once 'config.php';

header('Content-Type: application/json');

$response = ['success' => false, 'message' => 'Failed to load user profile.', 'user' => null];

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    $response['message'] = 'User not logged in.';
    echo json_encode($response);
    exit();
}

try {
    $user_id = $_SESSION['user_id'];

    // Fetch user data from the database
    $stmt = $pdo->prepare("SELECT full_name, email, phone, age, blood_type, city, address, last_donation_date FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch();

    if ($user) {
        $response['success'] = true;
        $response['message'] = 'User profile loaded successfully.';
        $response['user'] = [
            'fullName' => $user['full_name'], // Ensure these keys match your JS camelCase expectation
            'email' => $user['email'],
            'phone' => $user['phone'],
            'age' => $user['age'],
            'bloodType' => $user['blood_type'],
            'city' => $user['city'],
            'address' => $user['address'],
            'lastDonationDate' => $user['last_donation_date']
        ];
    } else {
        $response['message'] = 'User data not found for the logged-in user ID.';
        session_unset();
        session_destroy();
    }

} catch (PDOException $e) {
    error_log("Error fetching user profile: " . $e->getMessage());
    $response['message'] = 'Database error fetching user profile.';
}

echo json_encode($response);
exit();
?>