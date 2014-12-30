F2.Apps['com_openf2_examples_javascript_quote'] = function (appConfig, appContent, root) {

	var $root = $(root);
	var $caption = $('caption', $root);
	var $tbody = $('tbody', $root);
	var $addToWatchlist = $('a[data-watchlist-add]', $root);
	var $settings = $('form[data-f2-view="settings"]', $root);
	var _config = {
		refreshMode: 'page',
		autoRefresh: false
	};
	var _autoRefreshInterval = false;

	var _getQuote = function(symbolData) {

		appConfig.ui.showMask($root, true);

		appConfig.context = appConfig.context || {};

		if (!!symbolData){
			appConfig.context.symbol = symbolData.symbol;
		} else if(appConfig.context.symbol) {
			appConfig.context.symbol = appConfig.context.symbol;
		} else {
			appConfig.context.symbol = 'MSFT';//default to Microsoft
		}

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

		_getWatchListSymbols()
	};

	var _hasWatchListApp = function() {
		return !!$("div.com_openf2_examples_javascript_watchlist").length;
	};

	var _watchListHasSymbol = function(){
		return F2.inArray(appConfig.context.symbol, _getWatchListSymbols());
	};

	var _getWatchListSymbols = function(){
		var list = [];
		$('div.com_openf2_examples_javascript_watchlist tr[data-row]').each(function(idx,item){
			list.push($(item).attr('data-row'))
		});
		return list;
	}

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

			$caption.promise().done(function() {
				$(this)
					.empty()
					.append([
						'<h3 class="clearfix">',
							'<span class="last pull-left">', Format.number(quoteData.Data.LastPrice, 2), '</span>',
							'<span class="last-change pull-right">', Format.number(quoteData.Data.Change, {precision:2, withColors:true}), ' ', Format.number(quoteData.Data.ChangePercent, {precision:2, withColors:true, prefix:'(', suffix:'%)'}), '</span>',
						'</h3>'
					].join(''));
			});

			$tbody.promise().done(function() {
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
						'</tr>'
					].join(''));
			});

			$('span', $addToWatchlist).text(quoteData.Data.Symbol);
			$addToWatchlist
				.data('watchlist-add', quoteData.Data.Symbol)
				.closest('tr').toggleClass('hide', (!_hasWatchListApp() || _watchListHasSymbol()));

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
				F2.log('refreshed');
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

				if (!_hasWatchListApp()){
					appConfig.ui.Modals.alert("The Watchlist App is not on this container.");
				} else {

					F2.Events.emit(
						"F2_Examples_Watchlist_Add",
						{ symbol: $(this).data("watchlist-add") }
					);

					$(this).closest('tr').addClass('hide');
				}
			});			

			// bind save settings
			$root.on("click", "button.save", _saveSettings);

			// init typeahead
			_initTypeahead();

			// get quote
			_getQuote();
		}
	};
};