F2.Apps['com_openf2_examples_javascript_watchlist'] = (function (appConfig, appContent, root) {

	(function(){
		//http://javascript.crockford.com/remedial.html
		String.prototype.supplant = function(o) {
			return this.replace(/{([^{}]*)}/g,
				function(a, b) {
					var r = o[b];
					return typeof r === 'string' || typeof r === 'number' ? r : a;
				}
			);
		};
	})();

	var App = function(appConfig, appContent, root) {
    	this.appConfig = appConfig;
    	this.appContent = appContent;
    	this.root = root;
    	this.$root = $(root);
    	this.$settings = $('form[data-f2-view="settings"]', this.$root);
    	this.ui = this.appConfig.ui;
    	this.settings = {
    		allowExternalAdd: true
    	};
    }

    App.prototype.init = function() {
		this.ui.showMask(this.root);
		this.initLocalStorage();
		this.getData();
        this.initEvents();
    }

    App.prototype.DEFAULT_SYMBOLS = ["BA","BAC","GE","GS","INTC","CSCO"];
    App.prototype.COOKIE_NAME = "F2_Examples_Watchlist";

    App.prototype.ROW = ["<tr data-row='{symbol}'>",
							"<td class='first'>",
								"<a href='#' title='{name} (Click to set {symbol} context)' data-context='{symbol}' data-context-name='{name}'>{symbol}</a>",
							"</td>",
							"<td><strong>{price}</strong></td>",
							"<td><small>{change} ({changePct})</small></td>",
							"<td><small>{volume}</small></td>",
							"<td><a href='#' title='Remove from watchlist' data-remove='{symbol}'><i class='glyphicon glyphicon-remove'></i></a></td>",
						"</tr>",
						"<tr class='hide' data-row-detail='{symbol}'>",
							"<td colspan='5'>",
								"<table class='table table-condensed'>",
									"<thead>",
										"<tr>",
											"<th>Bid</th>",
											"<th>Ask</th>",
											"<th>Mkt Cap</th>",
											"<th>Last Trade</th>",
										"</tr>",
									"</thead>",
									"<tbody>",
										"<tr>",
											"<td>{bid}</td>",
											"<td>{ask}</td>",
											"<td>{cap}</td>",
											"<td>{asOfDate} {asOf}</td>",
										"</tr>",
									"</tbody>",
								"</table>",
							"</td>",
						"</tr>"
	].join("");

	App.prototype.data = [];

	App.prototype.initEvents = function(){

		//remove sym
		this.$root.on("click", "a[data-remove]", $.proxy(function(e){
			e.preventDefault();
			this.deleteSymbol($(e.currentTarget).attr("data-remove"));
		}, this));

		//add sym
		this.$root.on("click", "button.add", $.proxy(function(e){
			this.addSymbol($("input[name='lookup']", this.$root).val());
		}, this));

		//expand row
		this.$root.on("click", "tr[data-row]", $.proxy(function(e){
			var $this = $(e.currentTarget);
			$this.next().toggle();
		}, this));
 	
 		//change container context
 		this.$root.on("click", "a[data-context]", $.proxy(function(e){
 			e.preventDefault();
			F2.Events.emit(
    			F2.Constants.Events.APP_SYMBOL_CHANGE, {
    				symbol: $(e.currentTarget).attr("data-context"),
    				name: $(e.currentTarget).attr("data-context-name")
    			}
    		);
		}, this));

 		//listen for this event from other apps who may send symbols
 		if (this.settings.allowExternalAdd){
			F2.Events.on("F2_Examples_Watchlist_Add", $.proxy(function(data){
				var symbolAlert = $("div.symbolAlert", this.$root);
				symbolAlert = (symbolAlert.length)
					? symbolAlert
					: this._renderSymbolAlert();

				$("span:first", symbolAlert).text(data.symbol + " has been added.");

				this.addSymbol(data.symbol);
			},this));
		}

		// bind save settings
		this.$root.on("click", "button.save", $.proxy(function(){
			this._saveSettings();
		},this));

		this.ui.Views.change($.proxy(function(view) {
			if (view === F2.Constants.Views.SETTINGS) {
				this._populateSettings();
			}
		},this));
	}

	App.prototype._saveSettings = function(){
		this.settings.allowExternalAdd = $('input[name=allowExternalAdd]', this.$settings).is(':checked');
		this.ui.Views.change(F2.Constants.Views.HOME);
	}

	App.prototype._populateSettings = function(){
		$('input[name=allowExternalAdd]', this.$settings).attr('checked', this.settings.alltableswithkeys);
	}

	App.prototype.getSymbols = function(){
		return this._retrieveStoredSymbols();
	}

	App.prototype.setSymbols = function(syms){
		this._storeSymbols(syms);
	}

	App.prototype.addSymbol = function(sym){
		if (sym){
			this.ui.showMask(this.root);
			var s = this.getSymbols();
			s.push(sym.toUpperCase());
			this.setSymbols(s);

			$("input[name='lookup']", this.$root).val("").focus();
			this.getData();
		} else {
			this.ui.Modals.alert("Please enter a symbol.");
		}	
	}

	App.prototype.deleteSymbol = function(sym){
		this.ui.showMask(this.root);

		var curr = this.getSymbols(), updated = [];
		$.each(curr,function(idx,item){
			if (sym != item){
				updated.push(item);
			}
		});

		if (!updated.length) {
			this.ui.Modals.alert("You have deleted all the symbols in your watchlist. For the purposes of this example app, the default symbols have been re-added to your list.")
			updated = this.DEFAULT_SYMBOLS;
		}

		this.setSymbols(updated);

		this.data = [];
		this.getData();
	}

	App.prototype._supportsLocalStorage = function(){
		return (typeof(Storage) !== "undefined");
	}

	App.prototype.initLocalStorage = function(){
		if(this._supportsLocalStorage()){

			if (localStorage.F2_Examples_Watchlist == undefined || localStorage.F2_Examples_Watchlist == "" || !localStorage.F2_Examples_Watchlist){
				localStorage.F2_Examples_Watchlist = this.DEFAULT_SYMBOLS.join(",");
			}

		} else {
			if (!$.cookie(this.COOKIE_NAME) || $.cookie(this.COOKIE_NAME) == undefined || $.cookie(this.COOKIE_NAME) == ""){
				$.cookie(this.COOKIE_NAME, this.DEFAULT_SYMBOLS.join(","), { expires: 10 });
			}
		}

	}

	App.prototype._storeSymbols = function(syms){

		if(this._supportsLocalStorage()){
			localStorage.F2_Examples_Watchlist = syms.join(",");
		} else {
			$.cookie(this.COOKIE_NAME, syms.join(","), { expires: 10 });
		}
	}

	App.prototype._retrieveStoredSymbols = function(){
		if(this._supportsLocalStorage()){
			return localStorage.F2_Examples_Watchlist.split(",") || [];
		}
		else {
			return $.cookie(this.COOKIE_NAME).split(",") || [];
		}
	}

	App.prototype.drawSymbolList = function(){

		var table = [];
		table.push(
			'<table class="table table-condensed">',
				'<thead>',
					'<tr>',
						'<th class="first">Symbol</th>',
						'<th>Last</th>',
						'<th>Change / Pct</th>',
						'<th>Volume</th>',
						'<th>&nbsp;</th>',
					'</tr>',
				'</thead>',
				'<tbody>'
		);

		if (this.data.length < 1){
			table.push('<tr><td class="first" colspan="5">No symbols (or the Yahoo! API failed).</td></tr>')
		} else {
			$.each(this.data, $.proxy(function(idx,item){

				item = item || {};

				var quoteData = {
					name: 		item.Name,
					symbol: 	item.Symbol,
					price: 		AppFormat.lastPrice(item.LastTradePriceOnly),
					change: 	AppFormat.addColor(item.Change),
					changePct: 	AppFormat.addColor(item.ChangeinPercent),
					volume: 	AppFormat.getMagnitude(1,item.Volume,"shortcap"),
					asOf: 		item.LastTradeTime,
					asOfDate: 	item.LastTradeDate,
					bid: 		AppFormat.lastPrice(item.BidRealtime),
					ask: 		AppFormat.lastPrice(item.AskRealtime),
					cap: 	 	item.MarketCapitalization
				};

				table.push(this.ROW.supplant(quoteData));

			},this));
		}		

		table.push(
				'</tbody>',
			'</table>'
		);

		$("div.watchlist", this.root).html(table.join(''));

		this.ui.updateHeight();
		this.ui.hideMask(this.root);
	}

	App.prototype._renderSymbolAlert = function() {

		return $([
				'<div class="alert alert-success symbolAlert">',
					'<button type="button" class="close" data-dismiss="alert">&#215;</button>',
					'<span></span>',
				'</div>'
			].join(''))
			.prependTo($("." + F2.Constants.Css.APP_CONTAINER,this.root));
	};

	App.prototype.getData = function(){

		var symInput = [], oData;

		//no symbols? bail out.
		if (!this.getSymbols().length){
			this.drawSymbolList();
			return;
		}

		$.each(this.getSymbols(),function(idx,item){
			symInput.push('"'+item+'"');
		});

		oData = {
			q: 'select * from yahoo.finance.quotes where symbol in ('+ symInput.join(",") +')',
			format: 'json',
			env: 'store://datatables.org/alltableswithkeys'
		}

		//F2.log("data requested = ", oData);

		$.ajax({
			url: "http://query.yahooapis.com/v1/public/yql",
			data: oData,
			dataType: "jsonp",
			context: this
		}).done(function(jqxhr,txtStatus){

			//pretty bad response from yahoo when it fails.
			//jqxhr = {"query":{"count":0,"created":"2012-10-15T21:23:19Z","lang":"en-US","results":null}};
			
			//trap failed yahoo api
			if (jqxhr.query.results === null){
				jqxhr.query.results = {
					quote:{}
				}
			}

			this.data = [];
			
			//yahoo's API returns an array of objects if you ask for multiple symbols
			//but a single object if you only ask for 1 symbol
			if (jqxhr.query.count !== 0){
				if (jqxhr.query.count < 2){
					this.data = [jqxhr.query.results.quote] || this.data;
				} else {
					this.data = jqxhr.query.results.quote || this.data;
				}
			}

			this.drawSymbolList();

		}).fail(function(jqxhr,txtStatus){
			
			F2.log("OOPS. Yahoo! didn't work.");
			this.ui.Modals.alert("Your watchlist failed to load. Refresh.");

		});
	}


	/**
	 *  Number format helpers
	 */
	AppFormat = function(){
		this.magnitudes = {
			shortcap : ["", "K", "M", "B", "T"]
		};
	}

	AppFormat.prototype.getMagnitude = function(numDigits,value,type) {
		value = Math.abs(value);
		var c = 0;
		while (value >= 1000 && c < 4) {
			value /= 1000;
			c++;
		}
		value = value.toFixed(numDigits);
		return value + this.magnitudes[type][c];
	}

	AppFormat.prototype.lastPrice = function(value){
		value = Number(value);
		value = value.toFixed(2);
		return "$" + value;
	}

	AppFormat.prototype.addColor = function(value){
		if (value && value.length && value.charAt(0) == "+"){
			return "<span class='pos'>" + value + "</span>";
		} else if (value && value.length && value.charAt(0) == "-"){
			return "<span class='neg'>" + value + "</span>";
		} else {
			return value;
		}
	}

	AppFormat.prototype.comma = function(value) {
		value = String(value);
		if (value.length < 6 && value.indexOf(".") > -1) {
			return value;
		} else {
			x = value.split('.');
			x1 = x[0];
			x2 = x.length > 1 ? '.' + x[1] : '';
			var rgx = /(\d+)(\d{3})/;
			while (rgx.test(x1)) {
				x1 = x1.replace(rgx, '$1' + ',' + '$2');
			}
			return x1 + x2;
		}
	}

	AppFormat = new AppFormat();
	/**
	 * end number formatting helpers
	 */

    return App;

})();