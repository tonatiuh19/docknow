<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');
require_once('db_cnn/cnn.php');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    if (!isset($data['navios_user_id']) || empty($data['navios_user_id'])) {
        echo json_encode(['error' => 'Missing navios_user_id parameter']);
        $conn->close();
        exit;
    }

    $navios_user_id = intval($data['navios_user_id']);
    $sql = "SELECT * FROM navios_boats WHERE navios_user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $navios_user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $boats = [];
    while ($row = $result->fetch_assoc()) {
        $boats[] = $row;
    }
    echo json_encode($boats);
    $stmt->close();
    $conn->close();
} else {
    echo json_encode(['error' => 'Invalid request method']);
}
?>
