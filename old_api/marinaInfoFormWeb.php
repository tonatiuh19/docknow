<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');
require_once('db_cnn/cnn.php');

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'POST') {
    $result = [];

    // Marina Business Types
    $sql = "SELECT navios_marina_business_type_id, navios_marina_business_type_title, navios_marina_business_type_description, navios_marina_business_type_active 
            FROM navios_marina_business_types 
            WHERE navios_marina_business_type_active = 1";
    $marinaBusinessTypes = $conn->query($sql)->fetch_all(MYSQLI_ASSOC);

    // Boat Types
    $sql = "SELECT navios_boat_type_id, navios_boat_type_title, navios_boat_type_description, navios_boat_type_active 
            FROM navios_boat_types 
            WHERE navios_boat_type_active = 1";
    $boatTypes = $conn->query($sql)->fetch_all(MYSQLI_ASSOC);

    // Slip Sizes (Mooring Types)
    $sql = "SELECT navios_port_mooring_type_id, navios_port_mooring_type_title, navios_port_mooring_type_active 
            FROM navios_port_mooring_types 
            WHERE navios_port_mooring_type_active = 1";
    $slipSizes = $conn->query($sql)->fetch_all(MYSQLI_ASSOC);

    // Services
    $sql = "SELECT navios_port_service_type_id, navios_port_service_type_title, navios_port_service_type_active 
            FROM navios_port_service_types 
            WHERE navios_port_service_type_active = 1";
    $services = $conn->query($sql)->fetch_all(MYSQLI_ASSOC);

    // Amenities (Boat Feature Types)
    $sql = "SELECT navios_boat_feature_type_id, navios_boat_feature_type_title, navios_boat_feature_type_description, navios_boat_feature_type_category, navios_boat_feature_type_active 
            FROM navios_boat_feature_types 
            WHERE navios_boat_feature_type_active = 1";
    $amenities = $conn->query($sql)->fetch_all(MYSQLI_ASSOC);

    $result['marinaBusinessTypes'] = $marinaBusinessTypes;
    $result['boatTypes'] = $boatTypes;
    $result['slipSizes'] = $slipSizes;
    $result['services'] = $services;
    $result['amenities'] = $amenities;

    echo json_encode($result);
} else {
    echo json_encode(["error" => "Invalid request method"]);
}

if ($conn) {
    $conn->close();
}
?>