<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');
require_once('db_cnn/cnn.php');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $params = json_decode(file_get_contents('php://input'), true);
    if (!empty($params['navios_user_id'])) {
        $sql = "SELECT a.navios_users_session_valid_id, a.navios_user_id, a.navios_users_session_valid_active, a.navios_users_session_valid_created 
                FROM navios_users_session_valid as a 
                WHERE a.navios_user_id = ? 
                ORDER BY a.navios_users_session_valid_created DESC 
                LIMIT 1";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $params['navios_user_id']);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        echo json_encode($result);
        $stmt->close();
    } else {
        echo json_encode(['error' => 'Missing navios_user_id']);
    }
} else {
    echo json_encode(['error' => 'Invalid request method']);
}
$conn->close();
?>