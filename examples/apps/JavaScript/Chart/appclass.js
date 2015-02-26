F2.Apps["com_openf2_examples_javascript_chart"] = (function(){

	var app = function (appConfig, appContent, root) {
		this.symbol = "MSFT";
		this.appConfig = appConfig;
		this.appContent = appContent;
		this.ui = this.appConfig.ui;
		this.root = root;
		this.$root = $(root);
		this.$app = $("#f2-1year-chart", this.$root);
		//set configuration
		this.config();
	};

	app.prototype.config = function() {

		var defaults = {
			backgroundColor: '#fff',
			lineColor: '#428bca',
			lineWidth: 1.5,
			gridColor: '#DDDDDD',
			gridAltColor: '#F7F7F7',
			fontColor: '#444444',
			fontFamily: 'Arial, sans-serif',
			fontSize: 12,
			lineHeight: 1.2,
			greenBar: '#2EA94F',
			redBar: '#DB411C'
		},
		styleImport = (this.appConfig.context && this.appConfig.context.style)?this.appConfig.context.style:{};

		/** for example purposes*/
		console.group('Chart app');
		console.info('The chart app (com_openf2_examples_javascript_chart) has configuration options which can be overriden by using Context. Set a "style" property in the AppConfig\'s Context property. The current AppConfig is on the next line.');
		console.info(this.appConfig);
		console.info('The chart\'s configuration parameters (defaults) are found in the following hash');
		console.info(defaults);
		console.groupEnd();

		this.CHT_CONTAINER = 'f2-1year-chart';
		this.CHART_STYLES = $.extend({},defaults,styleImport);
	};

	app.prototype.redraw = function(data) {
		this.hc = null;
		this.symbol = data.symbol;
		this.getData();
	};

	app.prototype.init = function() {
		
		this.getData();

		//setup container symbol change listener to draw new chart.
		F2.Events.on(F2.Constants.Events.CONTAINER_SYMBOL_CHANGE, $.proxy(function(symbolData){
				this.redraw(symbolData);
			},this)
		);
	};

	app.prototype.getData = function() {

		this.ui.showMask(this.$root,true);

		$.ajax({
			beforeSend:function () {
				this.ui.setTitle('Loading chart...');
			},
			data: { 
				symbol: this.symbol, 
				duration: 365  // Fixed to one year 
			},
			url: 'http://dev.markitondemand.com/Api/Timeseries/jsonp',
			dataType: 'jsonp',
			context: this
			
		}).done(function(jqxhr,txtStatus){
			//Catch errors
			if ( !jqxhr.Data || jqxhr.Message ) {
				if ( typeof console == 'object' ) console.error('Error: ', jqxhr.Message);
				this._chartError(jqxhr);
				return;
			}
			this.HandleAPIData(jqxhr);

		}).fail(function(jqxhr,txtStatus){
			F2.log('Could not generate chart.', jqxhr);
			this._chartError(jqxhr);
		});
	};

	app.prototype._chartError = function(jqxhr) {
		F2.log("Price Chart Error", jqxhr);
		this.ui.setTitle("Chart Error");
		this.$app.html("<p>An error occurred loading price data for " +this.symbol+ ".</p>");
		this.ui.hideMask(this.$root);
		this.ui.updateHeight();
	};

	

	// Parses API data to provide HighCharts-ready data series for close values, 
	// additionally deriving up/down month indicators.
	//
	app.prototype.HandleAPIData = function (json) {

		$(this.CHT_CONTAINER).empty();

		// Set up vars for first data series
		var apiDates = json.Data.SeriesDates,
			apiValues = json.Data.Series.close.values,
			closeSeriesData = [ ];
		
		// Translate API JSON into a HighCharts-format data series
		for ( var i = 0; i < apiDates.length; i++ ) {
			var dat = new Date(apiDates[i]);
			var dateIn = Date.UTC(dat.getFullYear(), dat.getMonth(), dat.getDate());
			var val = apiValues[i];
			closeSeriesData.push([dateIn,val]);	
		}

		// Instantiate a new chart with base configuration options (everything but the data)
		var hcChartObj = new Highcharts.Chart(this.getBaselineOptions());
		hcChartObj.series[0].setData(closeSeriesData, true);  // Set close-values series data
		//hcChartObj.setTitle({ text: ('One-year price movement for ' + json.Data.Name).toUpperCase() });  // Set title
		hcChartObj.setTitle({ text:'' });

		this.ui.hideMask(this.$root);
		this.ui.setTitle("One-Year Price Movement " + this.symbol);
		
		// No options setting is available for this, so force the price line to be rounded 
		$('.highcharts-series path:first', this.root).attr('stroke-linejoin', 'round').attr('stroke-linecap', 'round');
		
		// Set up vars for up/down month data series
		var currentMonthName, currentJSDate, currentJSUTCDate, currentVal, 
			upSeriesData = [ ],
			downSeriesData = [ ];
		var dataRanges = hcChartObj.yAxis[0].getExtremes();  // Will need to reset to this later
			minVal = dataRanges.min,  // Will set red/green indicators to this value
			apiValues = json.Data.Series.close.values, 
			apiDates = json.Data.SeriesDates, 
			firstMonthName = apiDates[0].substr(4, 3),  // First!
			prevMonthName = firstMonthName, 
			prevJSDate = new Date(prevMonthName + ' 1, ' + apiDates[0].substr(-4)), 
			prevJSUTCDate = Date.UTC(prevJSDate.getFullYear(), prevJSDate.getMonth(), prevJSDate.getDate()), 
			prevVal = apiValues[0];
		
		// Now walk through all data points again (had to do it once before to get the ranges), 
		// looking for month boundaries and deciding if the previous month ended up or down over 
		// the preceding month's close
		for ( var i = 1; i < apiDates.length; i++ ) {
			currentMonthName = apiDates[i].substr(4, 3);
			if ( currentMonthName != prevMonthName ) {  // Into a new month in the data
				currentVal = apiValues[i - 1];  // Last close in the preceding month
				currentJSDate = new Date(currentMonthName + ' 1, ' + apiDates[i].substr(-4));
				currentJSUTCDate = Date.UTC(currentJSDate.getFullYear(), currentJSDate.getMonth(), currentJSDate.getDate());
				if ( prevMonthName != firstMonthName ) {  // Skip the first month, it's incomplete
					if ( currentVal >= prevVal ) {
						upSeriesData.push( [ prevJSUTCDate, minVal ], [ currentJSUTCDate, minVal ] );
						downSeriesData.push( [ currentJSUTCDate, null ] );
					}
					else {
						downSeriesData.push( [ prevJSUTCDate, minVal ], [ currentJSUTCDate, minVal ] );
						upSeriesData.push( [ currentJSUTCDate, null ] );
					}
				}
				prevVal = currentVal;
				prevMonthName = currentMonthName;
				prevJSUTCDate = currentJSUTCDate;
			}
		}
		// Add one last interval for the partial month-to-date
		currentVal = apiValues[i - 1];  // Last close value in the data
		currentJSDate = new Date(apiDates[i - 1]);
		currentJSUTCDate = Date.UTC(currentJSDate.getFullYear(), currentJSDate.getMonth(), currentJSDate.getDate());
		if ( currentVal >= prevVal ) upSeriesData.push( [ prevJSUTCDate, minVal ], [ currentJSUTCDate, minVal ] );
		else downSeriesData.push( [ prevJSUTCDate, minVal ], [ currentJSUTCDate, minVal ] );

		// Add the up month/down month data to the chart's series
        hcChartObj.series[1].setData(upSeriesData, false);
        hcChartObj.series[2].setData(downSeriesData, false);
        
        hcChartObj.yAxis[0].setExtremes(dataRanges.dataMin, dataRanges.dataMax, true, false);

		this.ui.updateHeight();
	};

	// Defines the HighCharts configuration options.
	//
	app.prototype.getBaselineOptions = function () { 
		return {
			chart: {
				borderColor: 'rgba(255, 255, 255, 0.0)',
				borderRadius: 0,
				defaultSeriesType: 'line',
				renderTo: this.CHT_CONTAINER,
				spacingBottom: 25,
				spacingLeft: 1,
				spacingRight: 1,
				backgroundColor: this.CHART_STYLES.backgroundColor
			},
			credits: {
				enabled: false
			},
			legend: {
				enabled: false
			},
			plotOptions: {
				line: {
					animation: false,
					lineWidth: this.CHART_STYLES.lineWidth
				},
				series: {
					marker: {
						enabled: false
					},
					shadow: false,
					states: {
						hover: {
							enabled: false
						}
					}
				}
			},
			series: [{
				color: this.CHART_STYLES.lineColor,
				name: 'Close price'
			},
			{ 
				color: this.CHART_STYLES.greenBar,
				lineWidth: 6,
				name: 'Up months'
			},
			{
				color: this.CHART_STYLES.redBar,
				lineWidth: 6,
				name: 'Down months'
			}],
			title: {
				align: 'left',
				style: {
					color: '#666',
					fontFamily: this.CHART_STYLES.fontFamily,
					fontSize: 14,
					fontWeight: 'bold',
					lineHeight: this.CHART_STYLES.lineHeight
				}
			},
			tooltip: {
				borderRadius: 1,
				crosshairs: true,
				formatter: function () {
					if ( this.series.name == 'Close price' ) {
						return '<div style="color: #777777; font-size: 12px;">' + Highcharts.dateFormat('%b %e %Y', this.x) + ': $' + Highcharts.numberFormat(this.y, 2) + '</div>';
					}
					else return false;
				},
				style: {
					color: this.CHART_STYLES.fontColor,
					fontFamily: this.CHART_STYLES.fontFamily,
					fontSize: this.CHART_STYLES.fontSize,
					lineHeight: this.CHART_STYLES.lineHeight,
					padding: this.CHART_STYLES.fontSize
				}
			},
			xAxis: [{  // Bottom datetime axis (short intervals)
				dateTimeLabelFormats: {
					minute: '%l:%M%P',
					hour: '%l%P',
					day: '%a',
					day: '%b %e',
					week: '%b %e',
					month: '%b',
					year: '%Y'
				},
				gridLineDashStyle: 'shortdot',
				gridLineColor: this.CHART_STYLES.gridAltColor,
				gridLineWidth: 1,
				labels: {
					align: 'left',
					style: {
						color: this.CHART_STYLES.fontColor,
						fontFamily: this.CHART_STYLES.fontFamily,
						fontSize: this.CHART_STYLES.fontSize
					},
					x: (this.CHART_STYLES.fontSize / 2),
					y: (this.CHART_STYLES.fontSize * this.CHART_STYLES.lineHeight * 1.5)
				},
				lineColor: this.CHART_STYLES.gridColor,
				tickColor: this.CHART_STYLES.gridColor,
				tickInterval: (30 * 24 * 3600 * 1000),  // One month
				tickLength: (this.CHART_STYLES.fontSize * this.CHART_STYLES.lineHeight * 1.5),
				type: 'datetime'
			},{  // Top datetime axis (longer intervals)
				dateTimeLabelFormats: {
					day: '%a',  // Default
					week: '%a',
					month: '%b %Y',
					year: '%Y'
				},
				gridLineWidth: 1,
				gridLineColor: this.CHART_STYLES.gridColor,
				labels: {
					align: 'left',
					style: {
						color: this.CHART_STYLES.fontColor,
						fontFamily: this.CHART_STYLES.fontFamily,
						fontSize: this.CHART_STYLES.fontSize
					},
					x: (this.CHART_STYLES.fontSize / 2)
				},
				lineColor: this.CHART_STYLES.gridColor,
				linkedTo: 0,
				opposite: true,
				tickColor: this.CHART_STYLES.gridColor,
				tickInterval: (365 * 24 * 3600 * 1000),  // One year
				tickLength: (this.CHART_STYLES.fontSize * this.CHART_STYLES.lineHeight),
				type: 'datetime'
			}],
			yAxis: [{
				gridLineColor: this.CHART_STYLES.gridColor,
				labels: {
					align: 'left',
					formatter: function () {
						return Highcharts.numberFormat(this.value, 2);
					},
					style: {
						color: this.CHART_STYLES.fontColor,
						fontFamily: this.CHART_STYLES.fontFamily,
						fontSize: this.CHART_STYLES.fontSize
					},
					x: 0,
					y: (this.CHART_STYLES.fontSize + 3)
				},
				maxPadding: 0,
				minPadding: 0,
				opposite: true,
				showFirstLabel: false,
				tickColor: this.CHART_STYLES.gridColor,
				tickLength: 100,  // Cropped at left of chart
				tickWidth: 1,
				title: {
					text: ''
				}
			}]
		};
	};

		return app;

})();