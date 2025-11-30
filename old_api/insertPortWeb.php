<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');
require_once('db_cnn/cnn.php');

function savePhotos($photos, $port_id) {
    $folder = "../ports_images/$port_id";
    if (!is_dir($folder)) {
        mkdir($folder, 0777, true);
    }
    $saved = [];
    foreach ($photos as $idx => $photo) {
        // Expecting base64 string: "data:image/jpeg;base64,...."
        if (preg_match('/^data:image\/(\w+);base64,/', $photo, $type)) {
            $data = substr($photo, strpos($photo, ',') + 1);
            $data = base64_decode($data);
            $ext = strtolower($type[1]);
            $filename = "photo_" . ($idx+1) . "." . $ext;
            $filepath = "$folder/$filename";
            file_put_contents($filepath, $data);
            $saved[] = $filepath;
        }
    }
    return $saved;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $params = json_decode(file_get_contents('php://input'), true);

    if (empty($params['navios_port_user_id'])) {
        echo json_encode(['error' => 'Missing navios_port_user_id']);
        $conn->close();
        exit;
    }

    // Insert into navios_ports
    $navios_port_place = $params['city'] . ', ' . $params['state'];
    $sql = "INSERT INTO navios_ports (
            navios_port_user_id, 
            navios_port_title, 
            navios_port_price, 
            navios_port_place, 
            navios_port_description, 
            navios_port_type, 
            navios_port_latitude, 
            navios_port_longitude, 
            navios_port_active,
            navios_port_created
        )
        VALUES (?, ?, '', ?, ?, ?, '', '', 2, NOW())";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param(
        "isssi",
        $params['navios_port_user_id'],
        $params['marinaName'],
        $navios_port_place,
        $params['description'],
        $params['businessTypeId']
    );
    if (!$stmt->execute()) {
        echo json_encode(['error' => 'Failed to insert port']);
        $stmt->close();
        $conn->close();
        exit;
    }
    $port_id = $stmt->insert_id;
    $stmt->close();

    // Insert into navios_port_info
    $sql = "INSERT INTO navios_port_info (navios_port_id, navios_port_info_contact_name, navios_port_info_contact_title, navios_port_info_address, navios_port_info_city, navios_port_info_state, navios_port_info_zip, navios_port_info_email_address, navios_port_info_email_phone_number, navios_port_info_website, navios_port_info_number_of_slips, navios_port_info_business_type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param(
        "isssssssssii",
        $port_id,
        $params['contactName'],
        $params['contactTitle'],
        $params['address'],
        $params['city'],
        $params['state'],
        $params['zipCode'],
        $params['email'],
        $params['phone'],
        $params['website'],
        $params['numberOfSlips'],
        $params['businessTypeId']
    );
    $stmt->execute();
    $stmt->close();

    // Insert slip sizes (moorings)
    if (!empty($params['slipSizeIds'])) {
        $sql = "INSERT INTO navios_port_moorings (navios_port_mooring_type_id, navios_port_id, navios_port_mooring_created) VALUES (?, ?, NOW())";
        $stmt = $conn->prepare($sql);
        foreach ($params['slipSizeIds'] as $id) {
            $id = intval($id);
            $stmt->bind_param("ii", $id, $port_id);
            $stmt->execute();
        }
        $stmt->close();
    }

    // Insert services
    if (!empty($params['serviceIds'])) {
        $sql = "INSERT INTO navios_port_services (navios_port_service_type_id, navios_port_id, navios_port_service_created) VALUES (?, ?, NOW())";
        $stmt = $conn->prepare($sql);
        foreach ($params['serviceIds'] as $id) {
            $id = intval($id);
            $stmt->bind_param("ii", $id, $port_id);
            $stmt->execute();
        }
        $stmt->close();
    }

    // Insert amenities (boat features)
    if (!empty($params['amenityIds'])) {
        $sql = "INSERT INTO navios_port_points (navios_port_point_type_id, navios_port_id, navios_port_point_created) VALUES (?, ?, NOW())";
        $stmt = $conn->prepare($sql);
        foreach ($params['amenityIds'] as $id) {
            $id = intval($id);
            $stmt->bind_param("ii", $id, $port_id);
            $stmt->execute();
        }
        $stmt->close();
    }

    // Insert boat types (if needed, adjust table as required)
    // Example: navios_port_boat_types (if exists)
    // if (!empty($params['boatTypeIds'])) { ... }

    // Save photos
    $savedPhotos = [];
    if (!empty($params['photos'])) {
        $savedPhotos = savePhotos($params['photos'], $port_id);
    }

    // Return all ports for this user
    $sql = "SELECT * FROM navios_ports WHERE navios_port_user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $params['navios_port_user_id']);
    $stmt->execute();
    $result = $stmt->get_result();
    $ports = [];
    while ($row = $result->fetch_assoc()) {
        $ports[] = $row;
    }
    $stmt->close();

    echo json_encode([
        'success' => true,
        'ports' => $ports,
        'savedPhotos' => $savedPhotos
    ]);
} else {
    echo json_encode(['error' => 'Invalid request method']);
}
$conn->close();
?>