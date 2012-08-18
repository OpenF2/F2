<?php
	$callback = $_REQUEST["callback"];
	$appRaw = $_REQUEST["app"];
	$appRaw = get_magic_quotes_gpc() ? stripslashes($appRaw) : $appRaw;
	$app = json_decode($appRaw);

	$serverPath = 
		((!empty($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] != "off") ? "https://" : "http://") .
		$_SERVER["SERVER_NAME"] .
		str_replace("index.php", "", $_SERVER["SCRIPT_NAME"]);

	// create a new AppAssets object
	$a = array(
		"Scripts" => array($serverPath . "app.js"),
		"Styles" => array(),
		"Widgets" => array(array("Html" => renderAppHtml($app))),
		"InlineScripts" => array(<<<INLINES
F2.Events.once(F2.Constants.Events.APPLICATION_LOAD + "{$app->instanceId}", function (app, appAssets) {
	var a = new App_Class(app, appAssets);
	a.init();
});
INLINES
		)
	);

	function renderAppHtml($app) {
		$isSecure = array_key_exists('isSecure', $app) && $app->isSecure
			? 'Secure'
			: '';

		return <<<HTML
<div class="well">
	<div class="f2-app-view" data-f2-view="home">
		$isSecure Hello World!
	</div>
</div>
HTML;
	}

	// output the jsonp
	header("Content-type: application/json");
	echo $callback . "(" . json_encode($a, JSON_HEX_TAG) . ")";
?>