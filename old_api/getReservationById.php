<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');
require_once('db_cnn/cnn.php');

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'POST') {
    $requestBody = file_get_contents('php://input');
    $params = json_decode($requestBody, true);

    // Require reservation ID
    if (empty($params['navios_users_reservation_id'])) {
        echo json_encode([
            "success" => false,
            "error" => "Reservation ID is required"
        ]);
        $conn->close();
        exit;
    }

    $reservationId = intval($params['navios_users_reservation_id']);

    // Get detailed reservation information
    $sql = "SELECT 
                r.navios_users_reservation_id,
                r.navios_user_id,
                r.navios_port_id,
                r.navios_boat_id,
                r.navios_users_reservation_start_date,
                r.navios_users_reservation_end_date,
                r.status,
                r.navios_users_reservation_created,
                r.navios_users_reservation_stripe_id,
                DATEDIFF(r.navios_users_reservation_end_date, r.navios_users_reservation_start_date) as total_nights,
                -- User info
                u.navios_user_id,
                u.navios_user_full_name,
                u.navios_user_email,
                u.navios_user_phone_number,
                u.navios_user_phone_number_code,
                u.navios_user_img,
                -- Port info
                p.navios_port_id,
                p.navios_port_title,
                p.navios_port_place,
                p.navios_port_price,
                p.navios_port_latitude,
                p.navios_port_longitude,
                p.navios_port_description,
                -- Boat info
                b.navios_boat_id,
                b.navios_boat_name,
                b.navios_boat_length,
                b.navios_boat_width,
                b.navios_boat_type
            FROM navios_users_reservations as r
            INNER JOIN navios_users as u ON u.navios_user_id = r.navios_user_id
            INNER JOIN navios_ports as p ON p.navios_port_id = r.navios_port_id
            LEFT JOIN navios_boats as b ON b.navios_boat_id = r.navios_boat_id
            WHERE r.navios_users_reservation_id = ?";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $reservationId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        // Calculate total amount
        $pricePerNight = floatval($row['navios_port_price']);
        $totalNights = intval($row['total_nights']);
        $totalAmount = $pricePerNight * $totalNights;

        $reservation = [
            'navios_users_reservation_id' => intval($row['navios_users_reservation_id']),
            'navios_user_id' => intval($row['navios_user_id']),
            'navios_port_id' => intval($row['navios_port_id']),
            'navios_boat_id' => intval($row['navios_boat_id']),
            'navios_users_reservation_start_date' => $row['navios_users_reservation_start_date'],
            'navios_users_reservation_end_date' => $row['navios_users_reservation_end_date'],
            'status' => intval($row['status']),
            'navios_users_reservation_created' => $row['navios_users_reservation_created'],
            'navios_users_reservation_stripe_id' => $row['navios_users_reservation_stripe_id'],
            'total_nights' => $totalNights,
            'total_amount' => number_format($totalAmount, 2, '.', ''),
            'user' => [
                'navios_user_id' => intval($row['navios_user_id']),
                'navios_user_full_name' => $row['navios_user_full_name'],
                'navios_user_email' => $row['navios_user_email'],
                'navios_user_phone_number' => $row['navios_user_phone_number'],
                'navios_user_phone_number_code' => $row['navios_user_phone_number_code'],
                'navios_user_img' => $row['navios_user_img']
            ],
            'port' => [
                'navios_port_id' => intval($row['navios_port_id']),
                'navios_port_title' => $row['navios_port_title'],
                'navios_port_place' => $row['navios_port_place'],
                'navios_port_price' => $row['navios_port_price'],
                'navios_port_latitude' => $row['navios_port_latitude'],
                'navios_port_longitude' => $row['navios_port_longitude'],
                'navios_port_description' => $row['navios_port_description']
            ],
            'boat' => null
        ];

        // Add boat info if exists
        if ($row['navios_boat_id'] && $row['navios_boat_name']) {
            $reservation['boat'] = [
                'navios_boat_id' => intval($row['navios_boat_id']),
                'navios_boat_name' => $row['navios_boat_name'],
                'navios_boat_length' => $row['navios_boat_length'],
                'navios_boat_width' => $row['navios_boat_width'],
                'navios_boat_type' => $row['navios_boat_type']
            ];
        }

        echo json_encode([
            "success" => true,
            "reservation" => $reservation
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "error" => "Reservation not found"
        ]);
    }

    $stmt->close();
} else {
    echo json_encode([
        "success" => false,
        "error" => "Invalid request method"
    ]);
}

$conn->close();
?>
