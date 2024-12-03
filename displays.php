<?php
if (session_status() == PHP_SESSION_NONE) { session_start(); }
require './requirements/functions.php';
$access_token = $_GET['access_token']; 
?>
<head>
  <script>
    var access_token = "<?php echo $access_token; ?>";
  </script>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Display Products</title>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/qrcode@1.4.4/build/qrcode.min.js"></script>
<link rel="stylesheet" href="./requirements/styles.css">

<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/selectize.js/0.15.2/css/selectize.default.min.css"
  integrity="sha512-pTaEn+6gF1IeWv3W1+7X7eM60TFu/agjgoHmYhAfLEU8Phuf6JKiiE8YmsNC0aCgQv4192s4Vai8YZ6VNM6vyQ=="
  crossorigin="anonymous"
  referrerpolicy="no-referrer"
/>
<script
  src="https://cdnjs.cloudflare.com/ajax/libs/selectize.js/0.15.2/js/selectize.min.js"
  integrity="sha512-IOebNkvA/HZjMM7MxL0NYeLYEalloZ8ckak+NDtOViP7oiYzG5vn6WVXyrJDiJPhl4yRdmNAG49iuLmhkUdVsQ=="
  crossorigin="anonymous"
  referrerpolicy="no-referrer"
></script>


</head>

<body>

<div id="mainContainerNoPrices">
<span class="reload noprint" id="refresh">&nbsp;&#x21bb;</span>
<div class="noprint centered" id="maintop">
  <div style="display: flex; justify-content: space-evenly; gap: 3.15%; width: 100%; max-width: 700px;">
    <div style="display: flex; flex-direction: column; align-items: center;">
      <button onClick="printEverything()" class="printButton centered">Print All Products</button>
      <button onClick="printSelectedProducts()" class="printButton centered">Print Selected Products</button>
    </div>
    <button onClick="clearSelectedProducts()" class="printButton centered" style="margin-top: 15px;">Clear Selected</button>
    <div style="display: flex; flex-direction: column; align-items: center;">
      <button onClick="printPrices('all')" class="printButton centered">Print All Prices</button>
      <button onClick="printPrices('selected')" class="printButton centered">Print Selected Prices</button>
    </div>
  </div>


  <div class="select-dropdown" style="margin: 15px 0 0 20px;">
    <select id="brandDropdown" class="selectDropdown" placeholder="Filter by Brand">
    </select>
  </div>
</div>

<div id="product-container" class="product-container"></div>
<div id="hideAfterLoaded" class="hideAfterLoaded">
  <span>
    Loading...
  </span>
</div>
</div>
<div id='appendPricesTo' class='priceAppend'></div>

<script src="./requirements/scripts.js"></script>


</body>




<!-- print popup -->
<div id="printOptionsModal" class="modal noprint">
  <div class="modal-content noprint">
  <span class="close-button noprint" onclick="closeModal()">&times;</span>
    <h2>Print Options</h2>
    <p>How many products would you like to print per page?</p>
    <button onclick="printProducts(4)" class="printButton">4 Products per Page</button>
    <button onclick="printProducts(2)" class="printButton">2 Products per Page</button>
  </div>
</div>
