<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');
require_once('db_cnn/cnn.php');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $params = json_decode(file_get_contents('php://input'), true);
    if (!empty($params['navios_user_email'])) {
        $sql = "SELECT a.navios_user_id, a.navios_user_email, a.navios_user_full_name, a.navios_user_date_of_birth, a.navios_user_phone_number, a.navios_user_phone_number_code, a.navios_user_stripe_id, a.navios_user_type, a.navios_user_created, a.navios_user_active FROM navios_users as a WHERE a.navios_user_email = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $params['navios_user_email']);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        echo json_encode($result);
        $stmt->close();
    } else {
        echo json_encode(['error' => 'Missing email']);
    }
} else {
    echo json_encode(['error' => 'Invalid request method']);
}
$conn->close();
?>