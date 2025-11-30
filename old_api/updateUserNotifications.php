<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');
require_once('db_cnn/cnn.php');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $params = json_decode(file_get_contents('php://input'), true);
    
    if (empty($params['navios_user_id'])) {
        echo json_encode(['error' => 'Missing navios_user_id']);
        $conn->close();
        exit;
    }

    $user_id = intval($params['navios_user_id']);
    $general_notifications = isset($params['navios_user_general_notifications']) ? intval($params['navios_user_general_notifications']) : null;
    $marketing_notifications = isset($params['navios_user_marketing_notifications']) ? intval($params['navios_user_marketing_notifications']) : null;

    // Build dynamic update query
    $updates = [];
    $types = '';
    $values = [];

    if ($general_notifications !== null) {
        $updates[] = 'navios_user_general_notifications = ?';
        $types .= 'i';
        $values[] = $general_notifications;
    }

    if ($marketing_notifications !== null) {
        $updates[] = 'navios_user_marketing_notifications = ?';
        $types .= 'i';
        $values[] = $marketing_notifications;
    }

    if (empty($updates)) {
        echo json_encode(['error' => 'No notification preferences provided']);
        $conn->close();
        exit;
    }

    $sql = "UPDATE navios_users SET " . implode(', ', $updates) . " WHERE navios_user_id = ?";
    $types .= 'i';
    $values[] = $user_id;

    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$values);

    if ($stmt->execute()) {
        // Return updated user data
        $sqlSelect = "SELECT navios_user_id, navios_user_email, navios_user_full_name, navios_user_date_of_birth, 
                             navios_user_phone_number, navios_user_phone_number_code, navios_user_country_code, 
                             navios_user_stripe_id, navios_user_type, navios_user_img, navios_user_general_notifications, 
                             navios_user_marketing_notifications, navios_user_created, navios_user_active 
                      FROM navios_users WHERE navios_user_id = ?";
        $stmtSelect = $conn->prepare($sqlSelect);
        $stmtSelect->bind_param("i", $user_id);
        $stmtSelect->execute();
        $userData = $stmtSelect->get_result()->fetch_assoc();
        $stmtSelect->close();
        
        echo json_encode(['success' => true, 'user' => $userData]);
    } else {
        echo json_encode(['error' => 'Update failed']);
    }

    $stmt->close();
} else {
    echo json_encode(['error' => 'Invalid request method']);
}

$conn->close();
?>
