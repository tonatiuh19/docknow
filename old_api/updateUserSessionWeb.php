<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');
require_once('db_cnn/cnn.php');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $params = json_decode(file_get_contents('php://input'), true);
    if (!empty($params['navios_users_session_valid_id']) && isset($params['navios_users_session_valid_active'])) {
        $sql = "UPDATE navios_users_session_valid SET navios_users_session_valid_active=? WHERE navios_users_session_valid_id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ii", $params['navios_users_session_valid_active'], $params['navios_users_session_valid_id']);
        $success = $stmt->execute();
        echo json_encode(['success' => $success]);
        $stmt->close();
    } else {
        echo json_encode(['error' => 'Missing session_id or active status']);
    }
} else {
    echo json_encode(['error' => 'Invalid request method']);
}
$conn->close();
?>