<?php

	$callback = $_REQUEST["callback"];
	$appRaw = $_REQUEST["app"];
	$app = json_decode($appRaw);

	// read in the news
	$doc = new DOMDocument();
	$doc->load('http://www.google.com/finance/company_news?q=FB&output=rss');
	$newsItems = array();
	foreach ($doc->getElementsByTagName('item') as $node) {
		$item = array ( 
			'title' => $node->getElementsByTagName('title')->item(0)->nodeValue,
			'desc' => $node->getElementsByTagName('description')->item(0)->nodeValue,
			'link' => $node->getElementsByTagName('link')->item(0)->nodeValue,
			'date' => $node->getElementsByTagName('pubDate')->item(0)->nodeValue
		);
    array_push($newsItems, $item);
  }

	// create a new AppAssets object
	$a = new AppAssets();

	// populate the scripts and styles

	// generate the html
	$a->Widgets[] = array("Html" => renderAppHtml($newsItems));

	// output the jsonp
	header("Content-type: application/json");
	echo $callback . "(" . json_encode($a, JSON_HEX_TAG) . ")";

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
		public $Scripts = array();
		public $Styles = array();
		public $InlineScripts = array();
		// temporary
		public $Widgets = array();
	}

	/**
	 * Renders the news articles
	 * @method renderAppHtml
	 * @param {Array} $newsItems The list of articles
	 * @return {string} The HTML for the App
	 */
	function renderAppHtml($newsItems) {
		$html = array();

		$html[] = '<div class="well"><ul>';

		foreach ($newsItems as $item) {
			$html[] = '<li>' . $item['title'] . '</li>';
		}

		$html[] = '</ul></div>';

		return join("", $html);
	}
?>