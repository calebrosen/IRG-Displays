<?php
if (session_status() == PHP_SESSION_NONE) { session_start(); }

require './requirements/functions.php';

header('Location: ' . $redirect);