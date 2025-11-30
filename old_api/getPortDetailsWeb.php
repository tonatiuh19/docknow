<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';

try {
    // Get POST data
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Get port ID from request
    $portId = isset($data['navios_port_id']) ? intval($data['navios_port_id']) : 0;
    
    if ($portId <= 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid port ID'
        ]);
        exit();
    }

    // Get port basic info
    $portQuery = "SELECT * FROM navios_ports WHERE navios_port_id = ?";
    $stmt = $conn->prepare($portQuery);
    $stmt->bind_param("i", $portId);
    $stmt->execute();
    $portResult = $stmt->get_result();
    
    if ($portResult->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Port not found'
        ]);
        exit();
    }
    
    $port = $portResult->fetch_assoc();
    
    // Get port type title
    $portTypeQuery = "SELECT navios_port_type_title FROM navios_port_types WHERE navios_port_type_id = ?";
    $stmt = $conn->prepare($portTypeQuery);
    $stmt->bind_param("i", $port['navios_port_type']);
    $stmt->execute();
    $portTypeResult = $stmt->get_result();
    if ($portTypeRow = $portTypeResult->fetch_assoc()) {
        $port['navios_port_type_title'] = $portTypeRow['navios_port_type_title'];
    }
    
    // Get port anchorages with titles
    $anchoragesQuery = "SELECT a.navios_port_anchorage_id, a.navios_port_anchorage_type_id, a.navios_port_anchorage_created, b.navios_port_anchorage_type_title
                        FROM navios_port_anchorages as a
                        INNER JOIN navios_port_anchorage_types as b ON b.navios_port_anchorage_type_id = a.navios_port_anchorage_type_id
                        WHERE a.navios_port_id = ?";
    $stmt = $conn->prepare($anchoragesQuery);
    $stmt->bind_param("i", $portId);
    $stmt->execute();
    $anchoragesResult = $stmt->get_result();
    $port['anchorages'] = [];
    while ($anchorage = $anchoragesResult->fetch_assoc()) {
        $port['anchorages'][] = $anchorage;
    }
    
    // Get port moorings with titles
    $mooringsQuery = "SELECT a.navios_port_mooring_id, a.navios_port_mooring_type_id, a.navios_port_mooring_created, b.navios_port_mooring_type_title
                      FROM navios_port_moorings as a
                      INNER JOIN navios_port_mooring_types as b ON b.navios_port_mooring_type_id = a.navios_port_mooring_type_id
                      WHERE a.navios_port_id = ?";
    $stmt = $conn->prepare($mooringsQuery);
    $stmt->bind_param("i", $portId);
    $stmt->execute();
    $mooringsResult = $stmt->get_result();
    $port['moorings'] = [];
    while ($mooring = $mooringsResult->fetch_assoc()) {
        $port['moorings'][] = $mooring;
    }
    
    // Get port points/amenities with titles
    $pointsQuery = "SELECT a.navios_port_point_id, a.navios_port_point_type_id, a.navios_port_point_created, b.navios_port_point_type_title
                    FROM navios_port_points as a
                    INNER JOIN navios_port_point_types as b ON b.navios_port_point_type_id = a.navios_port_point_type_id
                    WHERE a.navios_port_id = ?";
    $stmt = $conn->prepare($pointsQuery);
    $stmt->bind_param("i", $portId);
    $stmt->execute();
    $pointsResult = $stmt->get_result();
    $port['points'] = [];
    while ($point = $pointsResult->fetch_assoc()) {
        $port['points'][] = $point;
    }
    
    // Get port seabeds with titles
    $seabedsQuery = "SELECT a.navios_port_seabed_id, a.navios_port_seabed_type_id, a.navios_port_seabed_created, b.navios_port_seabed_type_title
                     FROM navios_port_seabeds as a
                     INNER JOIN navios_port_seabed_types as b ON b.navios_port_seabed_type_id = a.navios_port_seabed_type_id
                     WHERE a.navios_port_id = ?";
    $stmt = $conn->prepare($seabedsQuery);
    $stmt->bind_param("i", $portId);
    $stmt->execute();
    $seabedsResult = $stmt->get_result();
    $port['seabeds'] = [];
    while ($seabed = $seabedsResult->fetch_assoc()) {
        $port['seabeds'][] = $seabed;
    }
    
    // Get port services with titles
    $servicesQuery = "SELECT a.navios_port_service_id, a.navios_port_service_type_id, a.navios_port_service_created, b.navios_port_service_type_title
                      FROM navios_port_services as a
                      INNER JOIN navios_port_service_types as b ON b.navios_port_service_type_id = a.navios_port_service_type_id
                      WHERE a.navios_port_id = ?";
    $stmt = $conn->prepare($servicesQuery);
    $stmt->bind_param("i", $portId);
    $stmt->execute();
    $servicesResult = $stmt->get_result();
    $port['services'] = [];
    while ($service = $servicesResult->fetch_assoc()) {
        $port['services'][] = $service;
    }
    
    // Get ratings and comments
    $ratingsQuery = "SELECT navios_ports_ratings_id, navios_port_id, navios_ports_ratings_rate, navios_ports_ratings_rate_comment, navios_ports_ratings_created 
                     FROM navios_ports_ratings 
                     WHERE navios_port_id = ?";
    $stmt = $conn->prepare($ratingsQuery);
    $stmt->bind_param("i", $portId);
    $stmt->execute();
    $ratingsResult = $stmt->get_result();
    
    $ratings = [];
    $comments = [];
    $ratingSum = 0;
    $ratingCount = 0;
    while ($rating = $ratingsResult->fetch_assoc()) {
        $ratings[] = $rating;
        if (is_numeric($rating['navios_ports_ratings_rate'])) {
            $ratingSum += floatval($rating['navios_ports_ratings_rate']);
            $ratingCount++;
        }
        if (!empty($rating['navios_ports_ratings_rate_comment'])) {
            $comments[] = [
                'comment' => $rating['navios_ports_ratings_rate_comment'],
                'created' => $rating['navios_ports_ratings_created']
            ];
        }
    }
    
    $port['average_rating'] = $ratingCount > 0 ? round($ratingSum / $ratingCount, 2) : null;
    $port['ratings'] = $ratings;
    $port['comments'] = $comments;
    
    // Get port images
    $imagesQuery = "SELECT navios_port_img_url FROM navios_ports_images WHERE navios_port_id = ?";
    $stmt = $conn->prepare($imagesQuery);
    $stmt->bind_param("i", $portId);
    $stmt->execute();
    $imagesResult = $stmt->get_result();
    $port['images'] = [];
    while ($image = $imagesResult->fetch_assoc()) {
        $port['images'][] = $image['navios_port_img_url'];
    }
    
    // Fallback images if none exist
    if (empty($port['images'])) {
        $allImages = [
            "https://t3.ftcdn.net/jpg/03/91/30/54/360_F_391305437_W3R9yZLAJTkYQ3aAAWmAZhTkPdwXdPOz.jpg",
            "https://media.gq.com.mx/photos/60b0fcbffe7c1331bb811feb/master/pass/PLAYA.jpg",
            "https://data.pixiz.com/output/user/frame/preview/api/big/1/1/5/5/3185511_0ad1e.jpg"
        ];
        $port['images'] = $allImages;
    }
    
    // Keep photos for backward compatibility
    $port['photos'] = $port['images'];
    
    // Get all reservations for this port (including blocked dates)
    $reservationsQuery = "
        SELECT 
            r.*,
            u.navios_user_id,
            u.navios_user_full_name,
            u.navios_user_email,
            u.navios_user_phone_number,
            u.navios_user_phone_number_code,
            u.navios_user_img,
            b.navios_boat_name,
            b.navios_boat_length,
            b.navios_boat_type
        FROM navios_users_reservations r
        LEFT JOIN navios_users u ON r.navios_user_id = u.navios_user_id
        LEFT JOIN navios_boats b ON r.navios_boat_id = b.navios_boat_id
        WHERE r.navios_port_id = ?
        ORDER BY r.navios_users_reservation_start_date DESC
    ";
    
    $stmt = $conn->prepare($reservationsQuery);
    $stmt->bind_param("i", $portId);
    $stmt->execute();
    $reservationsResult = $stmt->get_result();
    
    $reservations = [];
    while ($reservation = $reservationsResult->fetch_assoc()) {
        // Calculate total nights
        $startDate = new DateTime($reservation['navios_users_reservation_start_date']);
        $endDate = new DateTime($reservation['navios_users_reservation_end_date']);
        $interval = $startDate->diff($endDate);
        $totalNights = $interval->days;
        
        // Calculate total amount
        $pricePerNight = floatval($port['navios_port_price']);
        $totalAmount = $pricePerNight * $totalNights;
        
        $reservation['total_nights'] = $totalNights;
        $reservation['total_amount'] = number_format($totalAmount, 2, '.', '');
        $reservation['price_per_night'] = $port['navios_port_price'];
        
        // Add user info as nested object
        if ($reservation['navios_user_id']) {
            $reservation['user'] = [
                'navios_user_id' => $reservation['navios_user_id'],
                'navios_user_full_name' => $reservation['navios_user_full_name'],
                'navios_user_email' => $reservation['navios_user_email'],
                'navios_user_phone_number' => $reservation['navios_user_phone_number'],
                'navios_user_phone_number_code' => $reservation['navios_user_phone_number_code'],
                'navios_user_img' => $reservation['navios_user_img']
            ];
        }
        
        // Add boat info as nested object (will be null for blocked dates)
        if ($reservation['navios_boat_id'] > 0 && $reservation['navios_boat_name']) {
            $reservation['boat'] = [
                'navios_boat_id' => $reservation['navios_boat_id'],
                'navios_boat_name' => $reservation['navios_boat_name'],
                'navios_boat_length' => $reservation['navios_boat_length'],
                'navios_boat_type' => $reservation['navios_boat_type']
            ];
        } else {
            $reservation['boat'] = null;
        }
        
        $reservations[] = $reservation;
    }
    
    $port['reservations'] = $reservations;
    
    // Calculate some quick stats
    $stats = [
        'total_reservations' => count($reservations),
        'confirmed_count' => 0,
        'pending_count' => 0,
        'blocked_count' => 0,
        'total_revenue' => 0
    ];
    
    foreach ($reservations as $res) {
        switch ($res['status']) {
            case 1:
                $stats['confirmed_count']++;
                $stats['total_revenue'] += floatval($res['total_amount']);
                break;
            case 2:
                $stats['pending_count']++;
                break;
            case 3:
                $stats['blocked_count']++;
                break;
        }
    }
    
    $port['stats'] = $stats;
    
    echo json_encode([
        'success' => true,
        'port' => $port
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
