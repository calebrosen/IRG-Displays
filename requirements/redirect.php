<?php
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
require 'functions.php';

//using refresh token to get access token
$curl = curl_init();
curl_setopt_array($curl, array(
    CURLOPT_URL => "https://accounts.zoho.com/oauth/v2/token?refresh_token=" . $refresh_token . "&client_id=" . $client_id . "&client_secret=" . $client_secret . "&grant_type=refresh_token",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST => "POST",
    CURLOPT_SSL_VERIFYHOST => 2,
    CURLOPT_SSL_VERIFYPEER => true,
));

$response = curl_exec($curl);
$err = curl_error($curl);

if ($err) {
    echo "cURL Error #:" . $err;
} else {
    $responseData = json_decode($response, true);
    if (isset($responseData['access_token'])) {
        $access_token = $responseData['access_token'];
        $_SESSION['access_token'] = $access_token;
        curl_close($curl);
        header('Location: ' . $url .'/displays/displays.php?access_token=' . $access_token);
    } else {
        echo "Failed to refresh the token. Response: " . $response;
        curl_close($curl);
    }
}