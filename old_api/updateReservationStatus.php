<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');
require_once('db_cnn/cnn.php');

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'POST') {
    $requestBody = file_get_contents('php://input');
    $params = json_decode($requestBody, true);

    // Require reservation ID and status
    if (empty($params['navios_users_reservation_id']) || !isset($params['status'])) {
        echo json_encode([
            "success" => false,
            "error" => "Reservation ID and status are required"
        ]);
        $conn->close();
        exit;
    }

    $reservationId = intval($params['navios_users_reservation_id']);
    $status = intval($params['status']);

    // Validate status values (1 = confirmed, 2 = being generated, 3 = blocked)
    if (!in_array($status, [1, 2, 3])) {
        echo json_encode([
            "success" => false,
            "error" => "Invalid status value. Must be 1 (confirmed), 2 (being generated), or 3 (blocked)"
        ]);
        $conn->close();
        exit;
    }

    // Optional: Verify the user owns the port for this reservation
    if (!empty($params['navios_user_id'])) {
        $userId = intval($params['navios_user_id']);
        
        $sqlVerify = "SELECT r.navios_users_reservation_id 
                      FROM navios_users_reservations as r
                      INNER JOIN navios_ports as p ON p.navios_port_id = r.navios_port_id
                      WHERE r.navios_users_reservation_id = ? AND p.navios_port_user_id = ?";
        
        $stmtVerify = $conn->prepare($sqlVerify);
        $stmtVerify->bind_param("ii", $reservationId, $userId);
        $stmtVerify->execute();
        $stmtVerify->store_result();
        
        if ($stmtVerify->num_rows === 0) {
            echo json_encode([
                "success" => false,
                "error" => "Unauthorized: You don't have permission to update this reservation"
            ]);
            $stmtVerify->close();
            $conn->close();
            exit;
        }
        $stmtVerify->close();
    }

    // Update the reservation status
    $sql = "UPDATE navios_users_reservations 
            SET status = ? 
            WHERE navios_users_reservation_id = ?";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $status, $reservationId);

    if ($stmt->execute()) {
        // Get the updated reservation details
        $sqlGet = "SELECT 
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
                    u.navios_user_full_name,
                    u.navios_user_email,
                    p.navios_port_title,
                    p.navios_port_price
                FROM navios_users_reservations as r
                INNER JOIN navios_users as u ON u.navios_user_id = r.navios_user_id
                INNER JOIN navios_ports as p ON p.navios_port_id = r.navios_port_id
                WHERE r.navios_users_reservation_id = ?";

        $stmtGet = $conn->prepare($sqlGet);
        $stmtGet->bind_param("i", $reservationId);
        $stmtGet->execute();
        $result = $stmtGet->get_result();

        if ($row = $result->fetch_assoc()) {
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
                'total_amount' => number_format($totalAmount, 2, '.', '')
            ];

            echo json_encode([
                "success" => true,
                "message" => "Reservation status updated successfully",
                "reservation" => $reservation
            ]);
        } else {
            echo json_encode([
                "success" => true,
                "message" => "Reservation status updated successfully"
            ]);
        }

        $stmtGet->close();
    } else {
        echo json_encode([
            "success" => false,
            "error" => "Failed to update reservation status: " . $stmt->error
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
