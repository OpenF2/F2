<?php
	$apps = $_REQUEST["params"];
	$apps = get_magic_quotes_gpc() ? stripslashes($apps) : $apps;
	$app = json_decode($apps);  
	$app = $app[0]; // this App doesn't support batchedRequests

	$serverPath = 
		((!empty($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] != "off") ? "https://" : "http://") .
		$_SERVER["SERVER_NAME"] .
		str_replace("helloworld.php", "", $_SERVER["SCRIPT_NAME"]);

	// create the AppManifest object
	$a = array(
		"scripts" => array($serverPath . "appclass.js"),
		"apps" => array(array("html" => renderAppHtml($app)))
	);

	function renderAppHtml($app) {
		return <<<HTML
<div>
	<div class="f2-app-view" data-f2-view="home">
		<p>Hello World!</p>
		<ul>
			<li><a href="#" class="testAlert">Alert Modal</a></li>
			<li><a href="#" class="testConfirm">Confirm Modal</a></li>
		</ul>
	</div>
</div>
HTML;
	}

	// output the jsonp
	header("Content-type: application/javascript");
	echo "F2_jsonpCallback_com_openf2_examples_php_helloworld(" . json_encode($a, JSON_HEX_TAG) . ")";
?>