F2.Apps['com_openf2_examples_javascript_quote'] = function (appConfig, appContent, root) {

	var $root = $(root);
	var $quote = $('div.quote', $root);
	var $settings = $('form[data-f2-view="settings"]', $root);
	var _config = {
		refreshMode: 'page',
		autoRefresh: false
	};
	var _defaultFormatOptions = {
		precision: 2,
		withColors: false,
		prefix: '',
		suffix: ''
	};
	var _autoRefreshInterval = false;

	/**
	 * Formats a number
	 * @method _formatNumber
	 * @param {number} raw The number to format
	 * @param {object|int} [options] If int, formats to X precision. If object, 
	 * formats according to options passed
	 */
	var _formatNumber = function(raw, options) {
		if (!raw) { return '--'; }

		options = typeof options === 'number' ? { precision: options } : options;
		options = $.extend({}, _defaultFormatOptions, options);

		var val = raw.toFixed(options.precision);
		val = options.prefix + val + options.suffix;

		return !!options.withColors
			? ('<span class="' + (raw > 0 ? 'positive' : raw < 0 ? 'negative' : 'unchanged') + '">' +  val + '</span>')
			: val;
	};

	var _getQuote = function(symbolData) {

		appConfig.ui.showMask($root, true);

		appConfig.context = appConfig.context || {};
		appConfig.context.symbol = !!symbolData ? symbolData.symbol : appConfig.context.symbol;

		$.ajax({
			url: 'http://dev.markitondemand.com/Api/Quote/jsonp',
			data: { symbol: appConfig.context.symbol },
			dataType: 'jsonp',
			success: _renderQuote,
			error: function() {

			},
			complete: function() {
				appConfig.ui.hideMask($root);
			}
		});
	};

	var _initTypeahead = function() {

		$('input[name=lookup]', $root)
			.autocomplete({
				autoFocus:true,
				minLength: 0,
				select: function (event, ui) {
					//F2.Events.emit(F2.Constants.Events.APP_SYMBOL_CHANGE, { symbol: ui.item.value, name: ui.item.label });
					_getQuote({ symbol: ui.item.value });
				},
				source: function (request, response) {

					$.ajax({
						url: '//dev.markitondemand.com/api/Lookup/jsonp',
						dataType: 'jsonp',
						data: {
							input: request.term
						},
						success: function (data) {
							response($.map(data, function (item) {
								return {
									label: item.Symbol + ' - ' + item.Name + ' (' + item.Exchange + ')',
									value: item.Symbol
								}
							}));
						}
					});
			}
		});
	};

	var _populateSettings = function() {
		$('input[name=refreshMode][value=' + _config.refreshMode + ']', $settings).prop('checked', true);
		$('input[name=autoRefresh]', $settings).prop('checked', _config.autoRefresh);
	};

	var _renderQuote = function(quoteData) {

		if (quoteData && quoteData.Data && quoteData.Data.Status == 'SUCCESS') {
			appConfig.ui.setTitle('Quote for ' + quoteData.Data.Name);

			$quote.fadeOut().promise().done(function() {
				$(this)
					.empty()
					.append([
						'<h3 class="last">', _formatNumber(quoteData.Data.LastPrice, 2), '</h3>',
						'<h4 class="lastChange">', _formatNumber(quoteData.Data.Change, {precision:2, withColors:true}), ' ', _formatNumber(quoteData.Data.ChangePercent, {precision:2, withColors:true, prefix:'(', suffix:'%)'}), '</h4>',
						'<table class="table table-condensed">',
							'<tr>',
								'<th>Range</th>',
								'<td>', _formatNumber(quoteData.Data.Low), ' - ', _formatNumber(quoteData.Data.High), '</td>',
							'</tr>',
							'<tr>',
								'<th>Open</th>',
								'<td>', _formatNumber(quoteData.Data.Open), '</td>',
							'</tr>',
							'<tr>',
								'<th>Volume</th>',
								'<td>', quoteData.Data.Volume, '</td>',
							'</tr>',
							'<tr>',
								'<th>Market Cap</th>',
								'<td>', quoteData.Data.MarketCap, '</td>',
							'</tr>',
						'</table>'
					].join(''))
					.fadeIn();
			});

		} else {
			F2.log('Un problemo!');
		}
	};

	var _saveSettings = function() {

		clearInterval(_autoRefreshInterval);

		_config.refreshMode = $('input[name=refreshMode]:checked', $settings).val();
		_config.autoRefresh = $('input[name=autoRefresh]', $settings).prop('checked');

		if (_config.autoRefresh) {
			F2.log('beginning refresh');
			_autoRefreshInterval = setInterval(function() {
				F2.log('here');
				_getQuote();
			}, 30000);
		}

		appConfig.ui.Views.change(F2.Constants.Views.HOME);
	};

	return {
		init: function() {
			// bind container symbol change
			F2.Events.on(
				F2.Constants.Events.CONTAINER_SYMBOL_CHANGE,
				function(symbolData) {
					if (_config.refreshMode == 'page') {
						_getQuote(symbolData);
					}
				}
			);

			// bind app symbol change
			F2.Events.on(
				F2.Constants.Events.APP_SYMBOL_CHANGE,
				function(symbolData) {
					if (_config.refreshMode == 'app') {
						_getQuote(symbolData);
					}
				}
			);

			// bind view change
			appConfig.ui.Views.change(function(view) {
				if (view === F2.Constants.Views.SETTINGS) {
					_populateSettings();
				}
			});

			// bind save settings
			$($root).on("click", "button.save", _saveSettings);

			// init typeahead
			_initTypeahead();

			// get quote
			_getQuote({ symbol: 'msft' });
		}
	};
};