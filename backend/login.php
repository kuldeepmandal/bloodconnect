<?php
// backend/login.php
session_start();
require_once 'config.php';

// Set Content-Type header to application/json before any output
header('Content-Type: application/json');

$response = ['success' => false, 'message' => 'An unknown error occurred.'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? ''); // Can be email or phone
    $password = $_POST['password'] ?? '';

    // Basic validation: ensure both username/email and password are provided
    if (empty($username) || empty($password)) {
        $response['message'] = 'Please enter both username/email and password.';
        echo json_encode($response);
        exit();
    }

    try {
        // Prepare SQL statement to fetch user by email or phone
        if (filter_var($username, FILTER_VALIDATE_EMAIL)) {
            $stmt = $pdo->prepare("SELECT id, password_hash FROM users WHERE email = ?");
        } else {
            $stmt = $pdo->prepare("SELECT id, password_hash FROM users WHERE phone = ?");
        }
        
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        // Verify user existence and password
        if ($user && password_verify($password, $user['password_hash'])) {
            // Password matches, log the user in
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['authenticated'] = true; // Set authenticated status

            $response['success'] = true;
            $response['message'] = 'Login successful!';
            $response['redirect'] = 'dashboard.html'; // Redirect to dashboard
        } else {
            // User not found or password does not match
            $response['message'] = 'Invalid credentials.';
        }

    } catch (PDOException $e) {
        // Log the error for debugging, do not expose to the user
        error_log("Login error: " . $e->getMessage());
        $response['message'] = 'Database error during login. Please try again later.';
    }
} else {
    $response['message'] = 'Invalid request method.';
}

echo json_encode($response);
exit(); // Ensure no further output after JSON is sent
?>