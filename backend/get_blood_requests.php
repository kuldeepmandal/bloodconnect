<?php
// backend/get_blood_requests.php
session_start();
require_once 'config.php';

header('Content-Type: application/json');

$response = ['success' => false, 'message' => 'An unknown error occurred.', 'requests' => []];

try {
    // Order by urgency level (Critical > Urgent > Normal) and then by most recent request date
    $sql = "SELECT id, patient_name, blood_type, units_needed, hospital_name, hospital_address, contact_person, contact_phone, urgency_level, date_needed, additional_info, request_date FROM blood_requests ORDER BY FIELD(urgency_level, 'critical', 'urgent', 'normal') ASC, request_date DESC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $response['success'] = true;
    $response['message'] = 'Blood requests retrieved successfully.';
    $response['requests'] = $requests;

} catch (PDOException $e) {
    error_log("Error fetching blood requests: " . $e->getMessage());
    $response['message'] = 'Database error fetching blood requests. Please try again later.';
}

echo json_encode($response);
exit();
?>