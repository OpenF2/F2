<?php
	date_default_timezone_set("America/New_York");

	$callback = $_REQUEST["callback"];
	$apps = $_REQUEST["params"];
	$apps = get_magic_quotes_gpc() ? stripslashes($apps) : $apps;
	$app = json_decode($apps);  
	$app = $app[0]; // this App doesn't support batchedRequests

	$serverPath = 
		((!empty($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] != "off") ? "https://" : "http://") .
		$_SERVER["SERVER_NAME"] .
		str_replace("index.php", "", $_SERVER["SCRIPT_NAME"]);

	// read in the news
	$doc = new DOMDocument();
	$doc->load(
		(array_key_exists('context', $app) && array_key_exists('symbol', $app->context))
			? "http://www.google.com/finance/company_news?q=" . $app->context->symbol . "&output=rss"
			: "http://news.google.com/news?ned=us&topic=b&output=rss"
	);
	$newsItems = array();
	foreach ($doc->getElementsByTagName('item') as $node) {
		$newsItems[] = array ( 
			'title' => $node->getElementsByTagName('title')->item(0)->nodeValue,
			'desc' => $node->getElementsByTagName('description')->item(0)->nodeValue,
			'link' => $node->getElementsByTagName('link')->item(0)->nodeValue,
			'date' => $node->getElementsByTagName('pubDate')->item(0)->nodeValue
		);
  }

	// create a new AppAssets object
	$a = new AppAssets();

	// populate the scripts, styles, inlines, html
	$a->Scripts[] = $serverPath . "app.js";
	$a->Styles[] = $serverPath . "style.css";
	$a->Apps[] = array("InstanceId" => $app->instanceId, "Html" => renderAppHtml($newsItems));
	$a->InlineScripts[] = <<<INLINES
F2.Events.once(F2.Constants.Events.APPLICATION_LOAD + "{$app->instanceId}", function (app, appAssets) {
	var a = new App_Class(app, appAssets, {baseUrl:'{$serverPath}'});
	a.init();
});
INLINES;

	// output the jsonp
	header("Content-type: application/json");
	echo $callback . "(" . json_encode($a, JSON_HEX_TAG) . ")";


	/**
	 * A class representing the assets (html, css, js) for an App
	 * @class AppAssets
	 */
	class AppAssets {
		public $Scripts = array();
		public $Styles = array();
		public $InlineScripts = array();
		// temporary
		public $Apps = array();
	}

	/**
	 * Renders the news articles
	 * @method renderAppHtml
	 * @param {Array} $newsItems The list of articles
	 * @return {string} The HTML for the App
	 */
	function renderAppHtml($newsItems) {
		$html = array();

		$html[] = '<div class="well f2-app-view" data-f2-view="home"><ul class="unstyled">';

		foreach ($newsItems as $item) {
			$date = date_format(new DateTime($item['date']), 'g:iA \o\n l M j, Y');
			$html[] = <<<HTML
<li>
	<a href="{$item['link']}" target="_blank">{$item['title']}</a>
	<time>$date</time>
</li>
HTML;
		}

		$html[] = '</ul></div>';

		return join("", $html);
	}
?>