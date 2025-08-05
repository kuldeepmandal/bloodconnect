<?php
// backend/request_blood.php
session_start();
require_once 'config.php';

header('Content-Type: application/json');

$response = ['success' => false, 'message' => 'An unknown error occurred.'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $patientName = trim($_POST['patientName'] ?? '');
    $bloodType = trim($_POST['bloodType'] ?? '');
    $unitsNeeded = intval($_POST['unitsNeeded'] ?? 0);
    $hospital = trim($_POST['hospital'] ?? '');
    $hospitalAddress = trim($_POST['hospitalAddress'] ?? '');
    $contactPerson = trim($_POST['contactPerson'] ?? '');
    $contactPhone = trim($_POST['contactPhone'] ?? '');
    $urgency = trim($_POST['urgency'] ?? '');
    $dateNeeded = trim($_POST['dateNeeded'] ?? '');
    $additionalInfo = trim($_POST['additionalInfo'] ?? '');

    if (empty($patientName) || empty($bloodType) || $unitsNeeded <= 0 || empty($hospital) || empty($hospitalAddress) || empty($contactPerson) || empty($contactPhone) || empty($urgency) || empty($dateNeeded)) {
        $response['message'] = 'Please fill all required fields.';
        echo json_encode($response);
        exit();
    }

    if (!preg_match("/^[0-9]{10,15}$/", $contactPhone)) {
        $response['message'] = 'Invalid contact phone number format. Please enter 10-15 digits.';
        echo json_encode($response);
        exit();
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO blood_requests (patient_name, blood_type, units_needed, hospital_name, hospital_address, contact_person, contact_phone, urgency_level, date_needed, additional_info) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
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

        $response['success'] = true;
        $response['message'] = 'Blood request submitted successfully!';
    } catch (PDOException $e) {
        error_log("Blood request error: " . $e->getMessage());
        $response['message'] = 'Database error during blood request. Please try again later.';
    }
} else {
    $response['message'] = 'Invalid request method.';
}

echo json_encode($response);
exit();
?>