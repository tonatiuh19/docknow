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
        
        // Get policy data
        $sql = "SELECT a.policy, a.policy_es, a.updated_at FROM navios_policy as a";
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $policyData = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if ($policyData) {
            // Return the appropriate policy based on language
            $response = [
                'policy' => ($language === 'es') ? $policyData['policy_es'] : $policyData['policy'],
                'updated_at' => $policyData['updated_at']
            ];
            echo json_encode($response);
        } else {
            echo json_encode(["error" => "Policy not found"]);
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
