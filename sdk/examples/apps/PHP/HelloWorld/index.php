<?php
	$apps = $_REQUEST["params"];
	$apps = get_magic_quotes_gpc() ? stripslashes($apps) : $apps;
	$app = json_decode($apps);  
	$app = $app[0]; // this App doesn't support batchedRequests

	$serverPath = 
		((!empty($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] != "off") ? "https://" : "http://") .
		$_SERVER["SERVER_NAME"] .
		str_replace("index.php", "", $_SERVER["SCRIPT_NAME"]);

	// create the AppManifest object
	$a = array(
		"scripts" => array($serverPath . "app.js"),
		"apps" => array(array("html" => renderAppHtml($app)))
	);

	function renderAppHtml($app) {
		$isSecure = array_key_exists('isSecure', $app) && $app->isSecure
			? 'Secure'
			: '';

		return <<<HTML
<div class="well">
	<div class="f2-app-view" data-f2-view="home">
		PHP $isSecure Hello World!
	</div>
</div>
HTML;
	}

	// output the jsonp
	header("Content-type: application/javascript");
	echo "F2_jsonpCallback_" . $app->appId . "(" . json_encode($a, JSON_HEX_TAG) . ")";
?>