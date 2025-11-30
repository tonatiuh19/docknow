<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');
require_once('db_cnn/cnn.php');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $params = json_decode(file_get_contents('php://input'), true);
    if (!empty($params['navios_user_id'])) {
        $sql = "UPDATE navios_users SET navios_user_active=0 WHERE navios_user_id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $params['navios_user_id']);
        $success = $stmt->execute();
        echo json_encode(['success' => $success]);
        $stmt->close();
    } else {
        echo json_encode(['error' => 'Missing user_id']);
    }
} else {
    echo json_encode(['error' => 'Invalid request method']);
}
$conn->close();
?>