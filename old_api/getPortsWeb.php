<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');
require_once('db_cnn/cnn.php');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $params = json_decode(file_get_contents('php://input'), true);

    if (empty($params['navios_port_user_id'])) {
        echo json_encode(['error' => 'Missing navios_port_user_id']);
        $conn->close();
        exit;
    }

    $sql = "SELECT * FROM navios_ports WHERE navios_port_user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $params['navios_port_user_id']);
    $stmt->execute();
    $result = $stmt->get_result();
    $ports = [];
    while ($row = $result->fetch_assoc()) {
        $port_id = $row['navios_port_id'];

        // Get port info
        $sqlInfo = "SELECT * FROM navios_port_info WHERE navios_port_id = ?";
        $stmtInfo = $conn->prepare($sqlInfo);
        $stmtInfo->bind_param("i", $port_id);
        $stmtInfo->execute();
        $infoResult = $stmtInfo->get_result();
        $row['info'] = $infoResult->fetch_assoc();
        $stmtInfo->close();

        // Get moorings
        $sqlMoorings = "SELECT * FROM navios_port_moorings WHERE navios_port_id = ?";
        $stmtMoorings = $conn->prepare($sqlMoorings);
        $stmtMoorings->bind_param("i", $port_id);
        $stmtMoorings->execute();
        $mooringsResult = $stmtMoorings->get_result();
        $moorings = [];
        while ($m = $mooringsResult->fetch_assoc()) {
            $moorings[] = $m;
        }
        $row['moorings'] = $moorings;
        $stmtMoorings->close();

        // Get services
        $sqlServices = "SELECT * FROM navios_port_services WHERE navios_port_id = ?";
        $stmtServices = $conn->prepare($sqlServices);
        $stmtServices->bind_param("i", $port_id);
        $stmtServices->execute();
        $servicesResult = $stmtServices->get_result();
        $services = [];
        while ($s = $servicesResult->fetch_assoc()) {
            $services[] = $s;
        }
        $row['services'] = $services;
        $stmtServices->close();

        // Get amenities (points)
        $sqlPoints = "SELECT * FROM navios_port_points WHERE navios_port_id = ?";
        $stmtPoints = $conn->prepare($sqlPoints);
        $stmtPoints->bind_param("i", $port_id);
        $stmtPoints->execute();
        $pointsResult = $stmtPoints->get_result();
        $points = [];
        while ($p = $pointsResult->fetch_assoc()) {
            $points[] = $p;
        }
        $row['amenities'] = $points;
        $stmtPoints->close();

        // Get photos (list files in ../ports_images/navios_port_id)
        $photos = [];
        $folder = "../ports_images/$port_id";
        if (is_dir($folder)) {
            foreach (scandir($folder) as $file) {
                if ($file !== '.' && $file !== '..') {
                    $photos[] = $folder . '/' . $file;
                }
            }
        }
        $row['photos'] = $photos;

        // Get active reservations for this port
        $sqlRes = "SELECT * FROM navios_users_reservations WHERE navios_port_id = ? AND status = 1";
        $stmtRes = $conn->prepare($sqlRes);
        $stmtRes->bind_param("i", $port_id);
        $stmtRes->execute();
        $resResult = $stmtRes->get_result();
        $reservations = [];
        while ($res = $resResult->fetch_assoc()) {
            $reservations[] = $res;
        }
        $row['active_reservations'] = $reservations;
        $stmtRes->close();

        $ports[] = $row;
    }
    $stmt->close();

    echo json_encode([
        'success' => true,
        'ports' => $ports
    ]);
} else {
    echo json_encode(['error' => 'Invalid request method']);
}
$conn->close();
?>