<?php
if (session_status() == PHP_SESSION_NONE) { session_start(); }
header('Content-Type: application/json');

// in the future, when we have more displays, or if we have over 200 active, will have to loop this for another API call to pull another 200

function pullDisplays($access_token) {
    $curlDisplays = curl_init();
    $pageNumber = 1;
    $per_page = 200;
    $filteredItems = [];


    // this do/while will loop the api call to run again if it has more pages of displays and will then merge the arrays
    do {
        $filterItems = [
            'organization_id' => '697533414',
            'filter_by' => 'Status.Active',
            'search_text' => 'DISPLAY-',
            'page' => $pageNumber,
            'per_page' => $per_page
        ];
        $getAllItemsURL = 'https://www.zohoapis.com/inventory/v1/items' . '?' . http_build_query($filterItems);

        curl_setopt($curlDisplays, CURLOPT_URL, $getAllItemsURL);
        curl_setopt($curlDisplays, CURLOPT_HTTPHEADER, ['Authorization: Zoho-oauthtoken ' . $access_token]);
        curl_setopt($curlDisplays, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($curlDisplays);

        if (curl_errno($curlDisplays)) {
            $error_msg = curl_error($curlDisplays);
            curl_close($curlDisplays);
            echo json_encode(["error" => true, "message" => "CURL Error: " . $error_msg]);
            return;
        }

        $responseArray = json_decode($response, true);
        if ($responseArray === null) {
            echo json_encode(["error" => true, "message" => "Invalid JSON received"]);
            return;
        }

        if (isset($responseArray['code']) && $responseArray['code'] == 0 && isset($responseArray['items'])) {
            foreach ($responseArray['items'] as $item) {
                if ($item['stock_on_hand'] > 0) {
                    $gnp_url = isset($item['cf_gnp_url']) ? $item['cf_gnp_url'] : null;
                    $filteredItems[] = [
                        'item_id' => $item['item_id'],
                        'name' => $item['name'],
                        'description' => $item['description'],
                        'stock_on_hand' => $item['stock_on_hand'],
                        'brand' => $item['brand'],
                        'manufacturer' => $item['manufacturer'],
                        'sale_price' => $item['rate'],
                        'regular_price' => $item['purchase_rate'],
                        'img_document_id' => $item['image_document_id'],
                        'gnp_url' => $gnp_url
                    ];
                }
            }
        } else {
            echo json_encode(["error" => true, "message" => "Could not pull records. Error message: " . ($responseArray['message'] ?? 'No error message provided.')]);
            return;
        }
        $hasMorePage = $responseArray["page_context"]["has_more_page"];
        $pageNumber++;
    } while ($hasMorePage);
  
    curl_close($curlDisplays);

    header('Content-Type: application/json');
    echo json_encode(["items" => $filteredItems]);
}

$rawData = file_get_contents("php://input");
$data = json_decode($rawData, true);

if (isset($data['access_token'])) {
    $access_token = $data['access_token'];
    pullDisplays($access_token);
} else {
    error_log("access_token not found in the POST data");
    http_response_code(400);
    echo json_encode(array("error" => "Missing access token"));
    exit;
}

