<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');
require_once('db_cnn/cnn.php');

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'POST') {
    $result = [];

    // Boat Types
    $sql = "SELECT navios_boat_type_id, navios_boat_type_title, navios_boat_type_description, navios_boat_type_active 
            FROM navios_boat_types 
            WHERE navios_boat_type_active = 1
            ORDER BY navios_boat_type_title";
    $boatTypes = $conn->query($sql)->fetch_all(MYSQLI_ASSOC);

    // Amenities (boat features)
    $sql = "SELECT navios_boat_feature_type_id, navios_boat_feature_type_title, navios_boat_feature_type_description, 
                   navios_boat_feature_type_category, navios_boat_feature_type_active 
            FROM navios_boat_feature_types 
            WHERE navios_boat_feature_type_active = 1 
            ORDER BY navios_boat_feature_type_category, navios_boat_feature_type_title";
    $amenities = $conn->query($sql)->fetch_all(MYSQLI_ASSOC);

    // Services
    $sql = "SELECT navios_port_service_type_id, navios_port_service_type_title, navios_port_service_type_active 
            FROM navios_port_service_types 
            WHERE navios_port_service_type_active = 1 
            ORDER BY navios_port_service_type_title";
    $services = $conn->query($sql)->fetch_all(MYSQLI_ASSOC);

    $result['boatTypes'] = $boatTypes;
    $result['amenities'] = $amenities;
    $result['services'] = $services;

    echo json_encode($result);

} else {
    echo json_encode(["error" => "Invalid request method"]);
}

if ($conn) {
    $conn->close();
}
?>