<?php
// backend/request_blood.php
session_start(); // Start session to potentially use user ID later if needed
require_once 'config.php'; // Include your database configuration

header('Content-Type: application/json'); // Indicate that the response will be JSON

$response = ['success' => false, 'message' => 'An unknown error occurred.'];

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Sanitize and retrieve form data
    $patientName = trim($_POST['patientName'] ?? '');
    $bloodType = trim($_POST['bloodType'] ?? '');
    $unitsNeeded = intval($_POST['unitsNeeded'] ?? 0); // Ensure it's an integer
    $hospital = trim($_POST['hospital'] ?? '');
    $hospitalAddress = trim($_POST['hospitalAddress'] ?? '');
    $contactPerson = trim($_POST['contactPerson'] ?? '');
    $contactPhone = trim($_POST['contactPhone'] ?? '');
    $urgency = trim($_POST['urgency'] ?? '');
    $dateNeeded = trim($_POST['dateNeeded'] ?? '');
    $additionalInfo = trim($_POST['additionalInfo'] ?? '');

    // Basic server-side validation
    if (empty($patientName) || empty($bloodType) || $unitsNeeded <= 0 || empty($hospital) || empty($hospitalAddress) || empty($contactPerson) || empty($contactPhone) || empty($urgency) || empty($dateNeeded)) {
        $response['message'] = 'Please fill all required fields.';
        echo json_encode($response);
        exit(); // Stop execution if validation fails
    }

    // Simple phone number validation (you might want a more robust regex)
    if (!preg_match("/^[0-9]{10,15}$/", $contactPhone)) {
        $response['message'] = 'Invalid contact phone number format. Please enter 10-15 digits.';
        echo json_encode($response);
        exit();
    }

    try {
        // Prepare SQL INSERT statement
        $stmt = $pdo->prepare("INSERT INTO blood_requests (patient_name, blood_type, units_needed, hospital_name, hospital_address, contact_person, contact_phone, urgency_level, date_needed, additional_info) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        // Execute the statement with the sanitized parameters
        $stmt->execute([
            $patientName,
            $bloodType,
            $unitsNeeded,
            $hospital,
            $hospitalAddress,
            $contactPerson,
            $contactPhone,
            $urgency,
            $dateNeeded,
            $additionalInfo
        ]);

        // Set success response
        $response['success'] = true;
        $response['message'] = 'Blood request submitted successfully!';
    } catch (PDOException $e) {
        // Log the database error for debugging purposes (do not show to user directly)
        error_log("Blood request error: " . $e->getMessage());
        $response['message'] = 'Database error during blood request. Please try again later.';
    }
} else {
    // Handle non-POST requests
    $response['message'] = 'Invalid request method.';
}

echo json_encode($response); // Send the JSON response back to the frontend
exit(); // Ensure no further output
?>