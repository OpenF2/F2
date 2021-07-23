F2.Apps['com_openf2_examples_csharp_stocktwits'] = (function () {
	var App_Class = function (appConfig, appContent, root) {
		// constructor
		this.appConfig = appConfig;
		this.appContent = appContent;
		this.$root = $(root); //if you're using jQuery.
		this.$app = $('div', this.$root);
		this.context = this.appConfig.context || {};
		this.symbol = this.context.symbol || 'MSFT'; //default to MSFT
		this.setupEvents();
	};

	App_Class.prototype.init = function () {
		this.getTwits();
	};

	App_Class.prototype.setupEvents = function () {
		F2.Events.on(
			F2.Constants.Events.CONTAINER_SYMBOL_CHANGE,
			$.proxy(function (data) {
				this.symbol = data.symbol;
				this.init();
			}, this)
		);
	};

	App_Class.prototype.getTwits = function () {
		$.ajax({
			//url: "http://www.openf2.org/api/stocktwits/" + this.symbol,
			url:
				'https://api.stocktwits.com/api/2/streams/symbol/' +
				this.symbol +
				'.json',
			data: {},
			cache: true,
			context: this
		})
			.done(function (data, txtStatus) {
				this.draw(data);
			})
			.fail(function (jqxhr, txtStatus) {
				console.error(
					'F2wits failed to load StockTwits data.',
					jqxhr,
					txtStatus
				);
				this.$app.html(
					'<p>An error occurred loading StockTwits data for ' +
						this.symbol +
						'.</p>'
				);
			});
	};

	App_Class.prototype.draw = function (data) {
		var html = [];
		var moment = window.moment || require('moment');

		if (data.errors) {
			html.push('StockTwits API unavailable.');
		} else {
			html.push('<table class="table">');

			$.each(
				data.messages,
				$.proxy(function (idx, item) {
					//body, created_at, source, symbols, user

					if (idx > 4) {
						return true;
					} //only show 5

					var body = item.body,
						created_at = moment(new Date(item.created_at))
							.startOf('hour')
							.fromNow(),
						id = item.id,
						source = item.source,
						symbols = item.symbols,
						user = item.user,
						symList = [];

					body = this.replaceURLWithHTMLLinks(body);
					body = this.replaceDollarSigns(body);

					//build list of symbols
					// $.each(symbols, function (idx, item) {
					//     symList.push(
					//         '<li>',
					//          //'<a href="http://stocktwits.com/symbol/',item.symbol,'" title="',item.title,'" target="_blank">$',item.symbol,'</a>',
					//          //' | ',
					//          '<a href="javascript:;" title="Change context to ', item.symbol, '" class="focus" data-symbol="', item.symbol, '" tabindex="-1">', item.symbol, '</a>',
					//         '</li>'
					//     );
					// });

					html.push(
						'<tr>',
						'<td class="avatar"><a target="_blank" href="http://stocktwits.com/',
						user.username,
						'"><img title="by ',
						user.username,
						'" src="',
						user.avatar_url,
						'" width="35" height="35"></td>',
						'<td>',
						body,
						'<div class="clearfix">',
						'<time class="pull-left">',
						created_at,
						'</time>',
						'</div>',
						'</td>',
						'</tr>'
					);
				}, this)
			);

			html.push('</table>');
		}

		this.$app.html(html.join(''));

		//assign event to change container focus
		$('a.focus', this.$app).click(function () {
			F2.Events.emit(F2.Constants.Events.APP_SYMBOL_CHANGE, {
				symbol: $(this).attr('data-symbol'),
				name: $(this).attr('data-symbol')
			});
		});
	};

	//http://stackoverflow.com/questions/37684/how-to-replace-plain-urls-with-links
	App_Class.prototype.replaceURLWithHTMLLinks = function (text) {
		var exp =
			/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
		return text.replace(exp, "<a target='_blank' href='$1'>$1</a>");
	};

	App_Class.prototype.replaceDollarSigns = function (text) {
		var exp = /\$([A-Za-z0-9_]+)/gi;
		//use this to link to StockTwits.com
		//return text.replace(exp,"<a target='_blank' href='http://stocktwits.com/symbol/$1'>$$$1</a>");

		//use this to apply focus to container
		return text.replace(
			exp,
			"<a href='javascript:;' data-symbol='$1' class='focus' title='Change context to $$$1'>$$$1</a>"
		);
	};

	return App_Class;
})();
