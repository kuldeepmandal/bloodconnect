<?php
// backend/register.php
session_start();
require_once 'config.php';

header('Content-Type: application/json');

$response = ['success' => false, 'message' => 'An unknown error occurred.'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $fullName = trim($_POST['fullName'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $bloodType = trim($_POST['bloodType'] ?? '');
    $lastDonation = trim($_POST['lastDonation'] ?? '');
    $city = trim($_POST['city'] ?? '');
    $address = trim($_POST['address'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirmPassword = $_POST['confirmPassword'] ?? '';
    $age = intval($_POST['age'] ?? 0); // Ensure 'age' is retrieved and converted to int

    // Basic validation
    if (empty($fullName) || empty($email) || empty($phone) || empty($bloodType) || empty($city) || empty($address) || empty($password) || empty($confirmPassword)) {
        $response['message'] = 'All required fields must be filled.';
        echo json_encode($response);
        exit();
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $response['message'] = 'Invalid email format.';
        echo json_encode($response);
        exit();
    }

    if ($password !== $confirmPassword) {
        $response['message'] = 'Passwords do not match.';
        echo json_encode($response);
        exit();
    }

    if (strlen($password) < 6) {
        $response['message'] = 'Password must be at least 6 characters long.';
        echo json_encode($response);
        exit();
    }
    
    // AGE VALIDATION: This check will now pass if age is provided in HTML
    if ($age < 18 || $age > 65) {
        $response['message'] = 'Donor age must be between 18 and 65 years.';
        echo json_encode($response);
        exit();
    }

    // Hash the password
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    // Prepare last_donation_date for database
    $lastDonationDate = !empty($lastDonation) ? $lastDonation : null;

    try {
        // Check if email already exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            $response['message'] = 'Email already registered.';
            echo json_encode($response);
            exit();
        }

        // Insert new user into database - age column added here
        $stmt = $pdo->prepare("INSERT INTO users (full_name, email, phone, blood_type, last_donation_date, city, address, password_hash, age) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$fullName, $email, $phone, $bloodType, $lastDonationDate, $city, $address, $passwordHash, $age]);

        $response['success'] = true;
        $response['message'] = 'Registration successful! You can now log in.';
       $response['redirect'] = 'login.html'; // Correct path relative to register.html
    } catch (PDOException $e) {
        // Log the error for debugging (not to display to user)
        error_log("Registration error: " . $e->getMessage());
        $response['message'] = 'Database error during registration. Please try again later.';
    }
} else {
    $response['message'] = 'Invalid request method.';
}

echo json_encode($response);
?>