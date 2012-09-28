F2.Apps['com_openf2_examples_javascript_quote'] = function (appConfig, appContent, root) {

	var $root = $(root);
	var $caption = $('caption', $root);
	var $tbody = $('tbody', $root);
	var $settings = $('form[data-f2-view="settings"]', $root);
	var _config = {
		refreshMode: 'page',
		autoRefresh: false
	};
	var _autoRefreshInterval = false;

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
			appConfig.ui.setTitle(quoteData.Data.Name);

			$caption.fadeOut().promise().done(function() {
				$(this)
					.empty()
					.append([
						'<h3>',
							'<span class="last pull-left">', Format.number(quoteData.Data.LastPrice, 2), '</span>',
							'<span class="last-change pull-right">', Format.number(quoteData.Data.Change, {precision:2, withColors:true}), ' ', Format.number(quoteData.Data.ChangePercent, {precision:2, withColors:true, prefix:'(', suffix:'%)'}), '</span>',
						'</h3>'
					].join(''))
					.fadeIn();
			});

			$tbody.fadeOut().promise().done(function() {
				$(this)
					.empty()
					.append([
						'<tr>',
							'<th>Range</th>',
							'<td><strong>', Format.number(quoteData.Data.Low), ' - ', Format.number(quoteData.Data.High), '</strong></td>',
						'</tr>',
						'<tr>',
							'<th>Open</th>',
							'<td><strong>', Format.number(quoteData.Data.Open), '</strong></td>',
						'</tr>',
						'<tr>',
							'<th>Volume</th>',
							'<td><strong>', Format.number(quoteData.Data.Volume, {withMagnitude:true,precision:1}), '</strong></td>',
						'</tr>',
						'<tr>',
							'<th>Market Cap</th>',
							'<td><strong>', Format.number(quoteData.Data.MarketCap, {withMagnitude:true,precision:1}), '</strong></td>',
						'</tr>',
						'<tr>',
							'<td colspan="2">',
								'<a href="javascript:;" class="pull-right" data-watchlist-add="', quoteData.Data.Symbol, '">+Add ', quoteData.Data.Symbol, ' to Watchlist</a>',
							'</td>',
						'</tr>',
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

	/**
	 * @class Format
	 * @static
	 */
	var Format = (function() {
		var _defaultOptions = {
			precision: 2,
			withColors: false,
			withMagnitude: false,
			prefix: '',
			suffix: ''
		};
		var _magnitudes = {
			'shortcap': ['', 'K', 'M', 'B', 'T']
		};

		return {
			/**
			 * Formats a number
			 * @method number
			 * @param {number} raw The number to format
			 * @param {object|int} [options] If int, formats to X precision. If
			 * object, formats according to options passed
			 */
			number:function(raw, options) {
				if (!raw) { return '--'; }

				options = typeof options === 'number' ? { precision: options } : options;
				options = $.extend({}, _defaultOptions, options);

				var val;

				if (options.withMagnitude) {
					var c = 0;
					raw = Math.abs(raw);
					while (raw >= 1000 && c < 4) {
						raw /= 1000;
						c++;
					}
					options.magnitudeType = options.magnitudeType || 'shortcap';
					options.suffix = _magnitudes[options.magnitudeType][c];
				}
					
				val = raw.toFixed(options.precision);
				val = options.prefix + val + options.suffix;

				return !!options.withColors
					? ('<span class="' + (raw > 0 ? 'positive' : raw < 0 ? 'negative' : 'unchanged') + '">' +  val + '</span>')
					: val;
			}
		};
	})();

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

			//Talk to External Watchlist App
			$root.on("click", "a[data-watchlist-add]", function(e){
				var $this = $(e.currentTarget),
					sym = $this.attr("data-watchlist-add");

				if (!$(".com_f2_examples_javascript_watchlist").length){
					appConfig.ui.Modals.alert("The Watchlist App is not on this container.");
				}

				F2.Events.emit(
					"F2_Examples_Watchlist_Add",
					{ symbol: sym }
				);
				$this.addClass("disabled");
			});			

			// bind save settings
			$root.on("click", "button.save", _saveSettings);

			// init typeahead
			_initTypeahead();

			// get quote
			_getQuote({ symbol: 'msft' });
		}
	};
};