F2.Apps["com_openf2_examples_javascript_helloworldlocale"] = (function() {

	var App_Class = function (appConfig, appContent, root) {
		this.appConfig = appConfig;
		this.appContent = appContent;
		this.ui = appConfig.ui;
		this.$root = $(root);
	};

	App_Class.prototype.init = function () {
		//set current locale
		$('#current_locale',this.$root).html( this.appConfig.containerLocale || 'Not defined in <code>F2.init()</code>' );
		$('#current_locale_date',this.$root).text( this._setCurrentDate(this.appConfig.containerLocale) );

		// bind symbol change event
		F2.Events.on(F2.Constants.Events.CONTAINER_SYMBOL_CHANGE, $.proxy(this._handleSymbolChange, this));
		F2.Events.on(F2.Constants.Events.CONTAINER_LOCALE_CHANGE, $.proxy(this._handleLocaleChange, this));
	};

	App_Class.prototype._handleSymbolChange = function (data) {
		
		var symbolAlert = $("div.symbolAlert", this.$root);
		symbolAlert = (symbolAlert.length)
			? symbolAlert
			: this._renderSymbolAlert();

		$("span:first", symbolAlert).text("The symbol has been changed to " + data.symbol);

		this.ui.updateHeight();
	};

	App_Class.prototype._handleLocaleChange = function (data) {
		
		//set current locale
		$('#current_locale',this.$root).text( data.locale );

		$('#current_locale_date',this.$root).text( this._setCurrentDate(data.locale) );

		this.ui.updateHeight();
	};

	App_Class.prototype._setCurrentDate = function(locale) {
		var d = new Date(), formattedDate, month = [];
		month[0] = 'January';
		month[1] = 'February';
		month[2] = 'March';
		month[3] = 'April';
		month[4] = 'May';
		month[5] = 'June';
		month[6] = 'July';
		month[7] = 'August';
		month[8] = 'September';
		month[9] = 'October';
		month[10] = 'November';
		month[11] = 'December';

		if ('en-gb' == locale){
			formattedDate = d.getDate() + ' ' + month[ d.getMonth() ] + ' ' + d.getFullYear();
		} else {
			formattedDate = month[ d.getMonth() ] + ' ' + d.getDate() + ', ' + d.getFullYear();
		}
		return formattedDate;
	};

	return App_Class;
})();