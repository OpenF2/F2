F2.Apps["com_markh_highchartsChart"] = (function(){

	//setup container symbol change listener to draw new chart.
	F2.Events.on(
		F2.Constants.Events.CONTAINER_SYMBOL_CHANGE,
		function(symbolData){
			cht.newChart(symbolData);
		}
	);

	//setup listener for duration change menu
	$("ul.dropdown-menu a", "div.appcom_markh_highchartsChart").bind("click",function(e){
		cht.changeTimeframe(e);
	});


	/**
	 * From https://github.com/markitondemand/DataApis/blob/master/MarkitTimeseriesServiceSample.js
	 */

	/** 
	 * Version 1.1, Jan 2012
	 */
	var Markit = {};
	/**
	 * Define the TimeseriesService.
	 * First argument is symbol (string) for the quote. Examples: AAPL, MSFT, JNJ, GOOG.
	 * Second argument is duration (int) for how many days of history to retrieve.
	 */
	Markit.TimeseriesService = function(symbol,duration){
	    this.symbol = symbol;
	    this.duration = duration;
	};

	Markit.TimeseriesService.prototype.PlotChart = function(){
	    
	    //Make JSON request for timeseries data
	    $.ajax({
	        beforeSend:function(){
	            $("#chartDemoContainer").text("Loading chart...");
	        },
	        data: { 
	            symbol: this.symbol, 
	            duration: this.duration 
	        },
	        url: "http://dev.markitondemand.com/Api/Timeseries/jsonp",
	        dataType: "jsonp",
	        context: this,
	        success: function(json){
	        	//Catch errors
			    if (!json.Data || json.Message){
			        F2.log("Error: ", json.Message);
			        return;
			    }
	            this.BuildDataAndChart(json);
	        },
	        error: function(){
	            F2.log("Couldn't generate chart.");
	        }
	    });
	};

	Markit.TimeseriesService.prototype.BuildDataAndChart = function(json){
	    var dateDS = json.Data.SeriesDates,
	        closeDS = json.Data.Series.close.values,
	        openDS = json.Data.Series.open.values,
	        closeDSLen = closeDS.length,
	        irregularIntervalDS = [];
		
	    /**
	     * Build array of arrays of date & price values
	     * Market data is inherently irregular and HighCharts doesn't 
	     * really like irregularity (for axis intervals, anyway)
	     */
	    for (var i=0; i<closeDSLen;i++){
	        var dat = new Date(dateDS[i]);
	        var dateIn = Date.UTC(dat.getFullYear(), dat.getMonth(), dat.getDate());
	        var val = closeDS[i];
	        irregularIntervalDS.push([dateIn,val]);	
	    }
		
	    //set dataset and chart label
	    this.oChartOptions.series[0].data = irregularIntervalDS;
	    this.oChartOptions.title.text = "Price History of " + json.Data.Name;
	    
	    //init chart
	    this.hc = new Highcharts.Chart(this.oChartOptions);
	};

	//Define the HighCharts options
	Markit.TimeseriesService.prototype.oChartOptions = {
		chart: {
			renderTo: 'chartDemoContainer'
		},
		title:{},
		subtitle: {
			text: 'Source: DataScope (Markit)'
		},
		xAxis: {
			type: 'datetime'
		},
		yAxis: [{ // left y axis
			title: {
				text: null
			},
			labels: {
				align: 'left',
				x: 3,
				y: 16,
				formatter: function() {
					return Highcharts.numberFormat(this.value, 0);
				}
			},
			showFirstLabel: false
		}, { // right y axis
			linkedTo: 0,
			gridLineWidth: 0,
			opposite: true,
			title: {
				text: null
			},
			labels: {
				align: 'right',
				x: -3,
				y: 16,
				formatter: function() {
					return Highcharts.numberFormat(this.value, 0);
				}
			},
			showFirstLabel: false
		}],
		tooltip: {
			shared: true,
			crosshairs: true
		},
		plotOptions: {
			series: {
				marker: {
					lineWidth: 1
				}
			}
		},
		series: [{
			name: "Close price",
			lineWidth: 2,
			marker: {
				radius: 0
			}
		}]
		//,credits:{ enabled:false },
	};


	/**
	 * Allows chart to be reset with container symbol change context.
	 */
	Markit.TimeseriesService.prototype.newChart = function(data){
		$("#chartDemoContainer").empty();
		this.hc = null;
		this.symbol = data.symbol;
		this.duration = data.duration || this.duration;
		this.PlotChart();
	};

	/** 
	 * Change timeframe of chart
	 */
	Markit.TimeseriesService.prototype.changeTimeframe = function(e){
		var $clicked = $(e.currentTarget);
		var timeframe = $clicked.attr("data-timeframe");
		var orig = {
			symbol: this.symbol,
			duration: this.duration
		};
		this.newChart($.extend(orig, {duration:timeframe}));

		//set active class
		$clicked.parents("ul").find("li").removeClass("active");
		$clicked.parent().addClass("active");
	};

	//go! 
	var cht = new Markit.TimeseriesService("GOOG", 90);
		cht.PlotChart();

	return cht;

	/**
	* Need help? Visit the API documentation at:
	* http://dev.markitondemand.com
	*/
});