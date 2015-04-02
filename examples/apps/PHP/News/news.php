<?php
	date_default_timezone_set("America/New_York");
	$DEFAULT_SYMBOL = 'MSFT';
	$DEFAULT_PROVIDER = 'google';
	$MAX_ARTICLES = 5;
	$PROVIDERS = array(
		'google' => array('display' => 'Google Finance', 'feed' => 'http://www.google.com/finance/company_news?output=rss&q='),
		'yahoo' => array('display' => 'Yahoo Finance', 'feed' => 'http://finance.yahoo.com/rss/headline?s=')
	);

	$apps = $_REQUEST["params"];
	$apps = get_magic_quotes_gpc() ? stripslashes($apps) : $apps;
	$app = json_decode($apps);  
	$app = $app[0]; // this App doesn't support batchedRequests
	$provider = (array_key_exists('context', $app) && array_key_exists('provider', $app->context) && array_key_exists($app->context->provider, $PROVIDERS))
		? $app->context->provider
		: $DEFAULT_PROVIDER;
	$symbol = (array_key_exists('context', $app) && array_key_exists('symbol', $app->context))
		? $app->context->symbol
		: $DEFAULT_SYMBOL;
	$serverPath = 
		((!empty($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] != "off") ? "https://" : "http://") .
		$_SERVER["SERVER_NAME"] .
		str_replace("news.php", "", $_SERVER["SCRIPT_NAME"]);

	// read in the news
	$xml_source = file_get_contents($PROVIDERS[$provider]['feed'] . $symbol);
	$doc = simplexml_load_string($xml_source);

	$newsItems = array();
	foreach ($doc->channel->item as $item) {
		$newsItems[] = array ( 
			'title' => $item->title,
			'desc' => $item->description,
			'link' => $item->link,
			'date' => $item->pubDate
		);
  }

	// create the AppManifest object
	$a = array(
		"scripts" => array($serverPath . "appclass.js"),
		"styles" => array($serverPath . "app.css"),
		"apps" => array(
			array(
				"html" => join('', array(
					'<div>',
						renderNews($newsItems),
						renderSettings(),
					'</div>'
				))
			)
		)
	);

	// output the jsonp
	header("Content-type: application/javascript");
	echo "F2_jsonpCallback_com_openf2_examples_php_news(" . json_encode($a, JSON_HEX_TAG) . ")";

	/**
	 * Renders the news articles
	 * @method renderNews
	 * @param {Array} $newsItems The list of articles
	 * @return {string} The News HTML
	 */
	function renderNews($newsItems) {
		global $MAX_ARTICLES;
		global $PROVIDERS;
		global $provider;
		global $doc;

		$html = array(
			'<div class="f2-app-view" data-f2-view="home">',
				/*'<header>',
					'<h1>',
						$doc->channel->title,
					'</h1>',
				'</header>',*/
				'<ul class="list-unstyled">'
		);

		for ($i = 0; $i < $MAX_ARTICLES; $i++) {
			$date = date_format(new DateTime($newsItems[$i]['date']), 'g:iA \o\n l M j, Y');
			$html[] = <<<HTML
<li>
	<a href="{$newsItems[$i]['link']}" target="_blank">{$newsItems[$i]['title']}</a>
	<time>$date</time>
</li>
HTML;
		}

		$html[] = join('', array(
				'</ul>',
				'<footer>',
					'<a href="', $doc->channel->link, '" target="_blank">',
						empty($doc->channel->copyright) ? ('Copyright &copy;' . date('Y') . ' ' . $PROVIDERS[$provider]['display']) : $doc->channel->copyright,
					'</a>',
				'</footer>',
			'</div>'
		));

		return join("", $html);
	}

	/**
	 * Renders the settings view
	 * @method renderSettings
	 * @return {string} The settings HTML
	 */
	function renderSettings() {

		global $PROVIDERS;
		global $provider;
		$providerHtml = array();

		foreach ($PROVIDERS as $key => $value) {
			$providerHtml[] = join('', array(
				'<div class="radio"><label>',
					'<input type="radio" name="provider" value="', $key, '" ', ($key == $provider ? 'checked' : '') ,'> ',
					$value['display'],
				'</label></div>'
			));
		}

		$html = array(
			'<form class="f2-app-view hide" data-f2-view="settings">',
				'<div class="checkbox" name="autoRefresh"><label>',
					'<input type="checkbox" name="autoRefresh"> 30-Second Auto-Refresh',
				'</label></div>',
				'<span class="help-block">News Provider:</span>',
				join('', $providerHtml),
				'<div class="form-actions">',
					'<button type="button" class="btn btn-primary save">Save</button> ',
					'<button type="button" class="btn btn-default cancel">Cancel</button>',
				'</div>',
			'</form>'
		);

		return join("", $html);
	}
?>