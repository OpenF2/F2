F2.Apps['com_openf2_examples_javascript_cds'] = (function (appConfig, appContent, root) {

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
    		allowExternalAdd: false
    	};
    };

    App.prototype.init = function() {
		this.ui.showMask(this.root);
		this.getData();
        this.initEvents();
    };

    App.prototype.COOKIE_NAME = "F2_Examples_CDS";

    App.prototype.ROW = [
    	'<tr>',
			'<td class=\'first\'>',
				'<a title=\'{name}\' href=\'#\' data-context=\'{name}\' data-context-name=\'{name}\'>{name}</a>',
			'</td>',
			'<td>{spread}</td>',
			'<td>{changePct}</td>',
		'</tr>'
	].join('');

	App.prototype.data = [];

	App.prototype.initEvents = function(){		

		// bind save settings
		this.$root.on("click", "button.save", $.proxy(function(){
			this._saveSettings();
		},this));

		this.ui.Views.change($.proxy(function(view) {
			if (view === F2.Constants.Views.SETTINGS) {
				this._populateSettings();
			}
		},this));
	};

	App.prototype._saveSettings = function(){
		this.settings.allowExternalAdd = $('input[name=allowExternalAdd]', this.$settings).is(':checked');
		this.ui.Views.change(F2.Constants.Views.HOME);
	};

	App.prototype._populateSettings = function(){
		$('input[name=allowExternalAdd]', this.$settings).attr('checked', this.settings.alltableswithkeys);
	}	

	App.prototype._supportsLocalStorage = function(){
		return (typeof(Storage) !== "undefined");
	};	

	App.prototype.drawTable = function(rTighteners, rWideners){
		var TightenerTable = [], WidenerTable = [], TableHeading = [], self = this;

		TableHeading.push(
			'<table class=\'table table-condensed\'>',
				'<thead>',
					'<tr>',
						'<th class=\'first\'>Name</th>',
						'<th>Spread (bps)</th>',
						'<th>1 Day<br />% Change</th>',
					'</tr>',
				'</thead>',
				'<tbody>'
		);

		TightenerTable = TightenerTable.concat(TableHeading);
		TightenerTable.push(
					rTighteners,
				'</tbody>',
			'</table>'
		);
		WidenerTable = WidenerTable.concat(TableHeading);
		WidenerTable.push(
					rWideners,
				'</tbody>',
			'</table>'
		);

		$("div.cdsMovers", this.root).html([
			'<h5>Global Daily Tighteners (five-year CDS)</h5>',
			TightenerTable.join(''),
			'<h5>Global Daily Wideners (five-year CDS)</h5>',
			WidenerTable.join('')].join('')
		);

		this.ui.updateHeight();
		this.ui.hideMask(this.root);
	};

	App.prototype.drawCDSList = function(bTighteners, cdsData){

		var label = bTighteners ? "Tightener" : "Widener";
		var rRows = [], self = this;

		if (cdsData.length < 1){
			rRows.push('<tr><td class="first" colspan="5">CDS '+label+' data unavailable.</td></tr>')
		} else {
			$.each(cdsData, function(idx,item){

				item = item || {};

				if(self.CloseDate == null && item.PrettyDate != null){
					self.CloseDate = item.PrettyDate;
					$('p.cdsDate span', self.root).html(self.CloseDate);
				}

				var cdsData = {
					name: 		item.LongName,
					spread: 	CDSAppFormat.bps(item.ConvSpread),
					changePct: 	CDSAppFormat.addColorPercent(item.DailyPercentChange)
				};

				rRows.push(self.ROW.supplant(cdsData));
			});
		}

		return rRows.join('');
	};	

	App.prototype.CloseDate = null;

	App.prototype.getData = function(){

		var rTightenerData = [], rWidenerData = [];
		var _url = "http://dev.markitondemand.com/Api/SovereignCDSMovers/jsonp";
		$.ajax({
			url: _url,
			data: {
				tightenersOnly: 1
			},
			dataType: "jsonp",
			context: this
		}).done(function(jqxhr){
			rTightenerData.push(this.drawCDSList(true, jqxhr.Data || []));
			$.ajax({
				url: _url,
				data: {
					tightenersOnly: 0
				},
				dataType: "jsonp",
				context: this
			}).done(function(jqxhr2){
				rWidenerData.push(this.drawCDSList(false, jqxhr2.Data || []));				
			}).fail(function(jqxh2r){
				F2.log("OOPS. CDS Wideners data was unavailable.");
				rWidenerData.push(this.drawCDSList(false, []));
			}).always(function(){
				this.drawTable(rTightenerData,rWidenerData);
			});
		}).fail(function(jqxhr){			
			F2.log("OOPS. CDS Tighteners data was unavailable.");
			rTightenerData.push(this.drawCDSList(true,[]));
			rWidenerData.push(this.drawCDSList(false, []));
			this.drawTable(rTightenerData,rWidenerData);
		});		
	};

	/**
	 *  Number format helpers
	 */
	CDSAppFormat = function(){
		this.magnitudes = {
			shortcap : ["", "K", "M", "B", "T"]
		};
	}

	CDSAppFormat.prototype.getMagnitude = function(numDigits,value,type) {
		value = Math.abs(value);
		var c = 0;
		while (value >= 1000 && c < 4) {
			value /= 1000;
			c++;
		}
		value = value.toFixed(numDigits);
		return value + this.magnitudes[type][c];
	}

	CDSAppFormat.prototype.lastPrice = function(value){
		value = Number(value);
		value = value.toFixed(2);
		return "$" + value;
	}

	CDSAppFormat.prototype.bps = function(value){
		value = Number(value);
		value = value.toFixed(2);
		return value;
	}

	CDSAppFormat.prototype.addColorPercent = function(value){
		if(value && !isNaN(value) && isFinite(value)){
			if (value > 0){
				return "<span class='pos'>" + value.toFixed(2) + "%</span>";
			} else {
				return "<span class='neg'>" + value.toFixed(2) + "%</span>";
			}
		}
		return value.toFixed(2) + '%';
	}

	CDSAppFormat.prototype.comma = function(value) {
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

	CDSAppFormat = new CDSAppFormat();
	/**
	 * end number formatting helpers
	 */

    return App;

})();