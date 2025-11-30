<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');
require_once('db_cnn/cnn.php');

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'POST') {
    $requestBody = file_get_contents('php://input');
    $params = json_decode($requestBody, true);

    if (isset($params['language'])) {
        $language = $params['language'];
        
        // Get terms data
        $sql = "SELECT a.terms, a.terms_es, a.updated_at FROM navios_terms as a";
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $termsData = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if ($termsData) {
            // Return the appropriate terms based on language
            $response = [
                'terms' => ($language === 'es') ? $termsData['terms_es'] : $termsData['terms'],
                'updated_at' => $termsData['updated_at']
            ];
            echo json_encode($response);
        } else {
            echo json_encode(["error" => "Terms not found"]);
        }
    } else {
        echo json_encode(["error" => "language parameter is required"]);
    }
} else {
    echo json_encode(["error" => "Invalid request method"]);
}

if ($conn) {
    $conn->close();
}
?>
