<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');
require_once('db_cnn/cnn.php');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    // Validate required fields
    if (
        empty($data['navios_user_id']) ||
        empty($data['navios_boat_name']) ||
        empty($data['navios_boat_model']) ||
        empty($data['navios_boat_length'])
    ) {
        echo json_encode(['error' => 'Missing required fields']);
        $conn->close();
        exit;
    }

    $sql = "INSERT INTO navios_boats (
        navios_user_id,
        navios_boat_name,
        navios_boat_model,
        navios_boat_shipyard,
        navios_boat_type_id,
        navios_boat_hull_type_id,
        navios_boat_length,
        navios_boat_width,
        navios_boat_draft,
        navios_boat_year,
        navios_boat_home_marina,
        navios_boat_registration_number,
        navios_boat_mmsi_number,
        navios_boat_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);
    $navios_boat_active = isset($data['navios_boat_active']) ? $data['navios_boat_active'] : 1;
    $stmt->bind_param(
        "isssiiiddisssi",
        $data['navios_user_id'],
        $data['navios_boat_name'],
        $data['navios_boat_model'],
        $data['navios_boat_shipyard'],
        $data['navios_boat_type_id'],
        $data['navios_boat_hull_type_id'],
        $data['navios_boat_length'],
        $data['navios_boat_width'],
        $data['navios_boat_draft'],
        $data['navios_boat_year'],
        $data['navios_boat_home_marina'],
        $data['navios_boat_registration_number'],
        $data['navios_boat_mmsi_number'],
        $navios_boat_active
    );

    if ($stmt->execute()) {
        $inserted_id = $stmt->insert_id;
        $sqlOne = "SELECT * FROM navios_boats WHERE navios_boat_id = ?";
        $stmtOne = $conn->prepare($sqlOne);
        $stmtOne->bind_param("i", $inserted_id);
        $stmtOne->execute();
        $result = $stmtOne->get_result();
        $boat = $result->fetch_assoc();
        echo json_encode($boat);
        $stmtOne->close();
    } else {
        echo json_encode(['error' => 'Insert failed']);
    }

    $stmt->close();
    $conn->close();
} else {
    echo json_encode(['error' => 'Invalid request method']);
}
?>