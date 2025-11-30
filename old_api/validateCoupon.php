<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');
require_once('db_cnn/cnn.php');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $params = json_decode(file_get_contents('php://input'), true);
    
    if (empty($params['coupon_code'])) {
        echo json_encode(['error' => 'Missing coupon_code']);
        $conn->close();
        exit;
    }

    $coupon_code = strtoupper(trim($params['coupon_code']));
    $current_date = date('Y-m-d H:i:s');

    // Validate coupon
    $sql = "SELECT c.*, p.navios_port_title, p.navios_port_place, p.navios_port_price
            FROM navios_port_coupons as c
            INNER JOIN navios_ports as p ON p.navios_port_id = c.navios_port_id
            WHERE c.coupon_code = ? 
            AND c.is_active = 1
            AND c.valid_from <= ?
            AND c.valid_until >= ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sss", $coupon_code, $current_date, $current_date);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode([
            'valid' => false,
            'error' => 'Coupon not found or expired'
        ]);
        $stmt->close();
        $conn->close();
        exit;
    }

    $coupon = $result->fetch_assoc();
    $stmt->close();

    // Check if max uses reached
    if ($coupon['max_uses'] !== null && $coupon['times_used'] >= $coupon['max_uses']) {
        echo json_encode([
            'valid' => false,
            'error' => 'Coupon has reached maximum number of uses'
        ]);
        $conn->close();
        exit;
    }

    // Return valid coupon data
    echo json_encode([
        'valid' => true,
        'coupon' => [
            'navios_port_coupon_id' => intval($coupon['navios_port_coupon_id']),
            'navios_port_id' => intval($coupon['navios_port_id']),
            'coupon_code' => $coupon['coupon_code'],
            'coupon_description' => $coupon['coupon_description'],
            'discount_type' => $coupon['discount_type'],
            'discount_value' => floatval($coupon['discount_value']),
            'min_days' => $coupon['min_days'] ? intval($coupon['min_days']) : null,
            'max_uses' => $coupon['max_uses'] ? intval($coupon['max_uses']) : null,
            'times_used' => intval($coupon['times_used']),
            'valid_from' => $coupon['valid_from'],
            'valid_until' => $coupon['valid_until']
        ],
        'port' => [
            'navios_port_id' => intval($coupon['navios_port_id']),
            'navios_port_title' => $coupon['navios_port_title'],
            'navios_port_place' => $coupon['navios_port_place'],
            'navios_port_price' => $coupon['navios_port_price']
        ]
    ]);
} else {
    echo json_encode(['error' => 'Invalid request method']);
}

$conn->close();
?>
