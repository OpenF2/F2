<?php

	/**
	 *
	 */
	class App {

	}

	/**
	 * A class representing the assets (html, css, js) for an App
	 * @class AppAssets
	 */
	class AppAssets {
		public $scripts = array();
		public $styles = array();
		public $inlineScripts = array();
		public $html = "";
	}

	$callback = $_REQUEST["callback"];
	$appRaw = $_REQUEST["app"];
	$app = json_decode($appRaw);

	// create a new AppAssets object
	$a = new AppAssets();

	// populate the scripts and styles

	// generate the html
	$a->html = $app->{"instanceId"};

	// output the jsonp
	header("Content-type: application/json");
	echo json_encode($a);
?>