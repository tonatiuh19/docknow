<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Only POST method allowed']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

$navios_user_id = isset($data['navios_user_id']) ? intval($data['navios_user_id']) : 0;
$navios_port_id = isset($data['navios_port_id']) ? intval($data['navios_port_id']) : 0;
$start_date = isset($data['start_date']) ? $data['start_date'] : '';
$end_date = isset($data['end_date']) ? $data['end_date'] : '';

// Validation
if (!$navios_user_id || !$navios_port_id || !$start_date || !$end_date) {
    echo json_encode([
        'success' => false,
        'message' => 'Missing required fields'
    ]);
    exit();
}

try {
    // Verify the user owns this port
    $verify_stmt = $pdo->prepare("
        SELECT navios_port_id 
        FROM navios_ports 
        WHERE navios_port_id = ? AND navios_port_user_id = ?
    ");
    $verify_stmt->execute([$navios_port_id, $navios_user_id]);
    
    if (!$verify_stmt->fetch()) {
        echo json_encode([
            'success' => false,
            'message' => 'Unauthorized: You do not own this port'
        ]);
        exit();
    }

    // Check for existing reservations in this date range
    $check_stmt = $pdo->prepare("
        SELECT navios_users_reservation_id
        FROM navios_users_reservations
        WHERE navios_port_id = ?
        AND (
            (navios_users_reservation_start_date <= ? AND navios_users_reservation_end_date >= ?)
            OR (navios_users_reservation_start_date <= ? AND navios_users_reservation_end_date >= ?)
            OR (navios_users_reservation_start_date >= ? AND navios_users_reservation_end_date <= ?)
        )
        AND status != 3
    ");
    $check_stmt->execute([
        $navios_port_id,
        $start_date, $start_date,
        $end_date, $end_date,
        $start_date, $end_date
    ]);
    
    if ($check_stmt->fetch()) {
        echo json_encode([
            'success' => false,
            'message' => 'Cannot block dates: There are existing confirmed or pending reservations in this date range'
        ]);
        exit();
    }

    // Create a blocked reservation (status = 3)
    // Note: We'll use navios_boat_id = 0 to indicate this is a blocked period, not a real reservation
    $insert_stmt = $pdo->prepare("
        INSERT INTO navios_users_reservations (
            navios_user_id,
            navios_port_id,
            navios_boat_id,
            navios_users_reservation_start_date,
            navios_users_reservation_end_date,
            status,
            navios_users_reservation_created,
            navios_users_reservation_stripe_id
        ) VALUES (?, ?, 0, ?, ?, 3, NOW(), '')
    ");
    
    $insert_stmt->execute([
        $navios_user_id,
        $navios_port_id,
        $start_date,
        $end_date
    ]);

    $blocked_id = $pdo->lastInsertId();

    echo json_encode([
        'success' => true,
        'message' => 'Dates blocked successfully',
        'blocked_reservation_id' => $blocked_id
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
