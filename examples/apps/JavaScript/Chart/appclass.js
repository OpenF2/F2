/* global F2, $, console, Highcharts, F2_jsonpCallback_com_openf2_examples_javascript_chart */

F2.Apps['com_openf2_examples_javascript_chart'] = (function() {

  var MS_MONTH = 30 * 24 * 3600 * 1000;
  var MS_YEAR = 365 * 24 * 3600 * 1000;

  var CHART_API_URL = 'http://dev.markitondemand.com/Api/Timeseries/jsonp';

  var CHART_DEFAULT_STYLES = {
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
  };

  function AppClass(appConfig, appContent, root) {
    this.appConfig = appConfig;
    this.appContent = appContent;
    this.ui = this.appConfig.ui;
    this.root = root;
    this.$root = $(root);

    this.symbol = 'MSFT';
    this.chartContainer = 'f2-1year-chart';
    this.$app = $('#' + this.chartContainer, this.$root);

    var styleImport = appConfig.context ? appConfig.context.style : {};
    this.chartStyles = $.extend({}, CHART_DEFAULT_STYLES, styleImport);
  }

  AppClass.prototype.init = function() {
    this.getData();

    // Setup container symbol change listener to draw new chart
    F2.Events.on(F2.Constants.Events.CONTAINER_SYMBOL_CHANGE, $.proxy(function(symbolData) {
      this.symbol = symbolData.symbol;
      this.getData();
    }, this));
  };

  AppClass.prototype.getData = function() {
    this.ui.showMask(this.$root, true);
    this.ui.setTitle('Loading chart...');

    $.ajax({
      data: {
        symbol: this.symbol,
        duration: 365
      },
      url: CHART_API_URL,
      dataType: 'jsonp',
      context: this
    }).done(function(jqxhr, txtStatus) {
      if (!jqxhr.Data || jqxhr.Message) {
        F2.log('error', 'Error: ', jqxhr.Message);
        this._chartError(jqxhr);
        return;
      }

      this.handleApiData(jqxhr);
    }).fail(function(jqxhr, txtStatus) {
      F2.log('Could not generate chart.', jqxhr);
      this._chartError(jqxhr);
    });
  };

  AppClass.prototype._chartError = function(jqxhr) {
    F2.log('Price Chart Error', jqxhr);
    this.$app.html('<p>An error occurred loading price data for ' + this.symbol + '.</p>');
    this.ui.setTitle('Chart Error');
    this.ui.hideMask(this.$root);
    this.ui.updateHeight();
  };

  AppClass.prototype._closeSeriesData = function(apiDates, apiValues) {
    var closeSeriesData = [];

    for (var i = 0; i < apiDates.length; i++) {
      var dat = new Date(apiDates[i]);
      var dateIn = Date.UTC(dat.getFullYear(), dat.getMonth(), dat.getDate());
      var val = apiValues[i];
      closeSeriesData.push([dateIn, val]);
    }

    return closeSeriesData;
  };

  // Parses API data to provide HighCharts-ready data series for close values,
  // additionally deriving up/down month indicators.
  AppClass.prototype.handleApiData = function(json) {
    $(this.chartContainer).empty();

    // Set up vars for first data series
    var apiDates = json.Data.SeriesDates;
    var apiValues = json.Data.Series.close.values;
    var closeSeriesData = this._closeSeriesData(apiDates, apiValues);

    // Instantiate a new chart with base configuration options (everything but the data)
    var hcChartObj = new Highcharts.Chart(this.getBaselineOptions());
    // Set close-values series data
    hcChartObj.series[0].setData(closeSeriesData, true);
    hcChartObj.setTitle({ text: '' });

    this.ui.hideMask(this.$root);
    this.ui.setTitle('One-Year Price Movement ' + this.symbol);

    // No options setting is available for this, so force the price line to be rounded
    $('.highcharts-series path:first', this.root).attr('stroke-linejoin', 'round').attr('stroke-linecap', 'round');

    // Set up vars for up/down month data series
    var currentMonthName, currentJSDate, currentJSUTCDate, currentVal;
    var upSeriesData = [];
    var downSeriesData = [];
    // Will need to reset to this later
    var dataRanges = hcChartObj.yAxis[0].getExtremes();
    // Will set red/green indicators to this value
    var minVal = dataRanges.min;
    var firstMonthName = apiDates[0].substr(4, 3);
    var prevMonthName = firstMonthName;
    var prevJSDate = new Date(prevMonthName + ' 1, ' + apiDates[0].substr(-4));
    var prevJSUTCDate = Date.UTC(prevJSDate.getFullYear(), prevJSDate.getMonth(), prevJSDate.getDate());
    var prevVal = apiValues[0];

    // Now walk through all data points again (had to do it once before to get the ranges),
    // looking for month boundaries and deciding if the previous month ended up or down over
    // the preceding month's close
    for (var i = 1; i < apiDates.length; i++) {
      currentMonthName = apiDates[i].substr(4, 3);

      // Into a new month in the data
      if (currentMonthName !== prevMonthName) {
        // Last close in the preceding month
        currentVal = apiValues[i - 1];
        currentJSDate = new Date(currentMonthName + ' 1, ' + apiDates[i].substr(-4));
        currentJSUTCDate = Date.UTC(currentJSDate.getFullYear(), currentJSDate.getMonth(), currentJSDate.getDate());

        // Skip the first month, it's incomplete
        if (prevMonthName !== firstMonthName) {
          if (currentVal >= prevVal) {
            upSeriesData.push([prevJSUTCDate, minVal], [currentJSUTCDate, minVal]);
            downSeriesData.push([currentJSUTCDate, null]);
          } else {
            downSeriesData.push([prevJSUTCDate, minVal], [currentJSUTCDate, minVal]);
            upSeriesData.push([currentJSUTCDate, null]);
          }
        }
        prevVal = currentVal;
        prevMonthName = currentMonthName;
        prevJSUTCDate = currentJSUTCDate;
      }
    }

    // Add one last interval for the partial month-to-date
    currentVal = apiValues[i - 1]; // Last close value in the data
    currentJSDate = new Date(apiDates[i - 1]);
    currentJSUTCDate = Date.UTC(currentJSDate.getFullYear(), currentJSDate.getMonth(), currentJSDate.getDate());

    if (currentVal >= prevVal) {
      upSeriesData.push([prevJSUTCDate, minVal], [currentJSUTCDate, minVal]);
    } else {
      downSeriesData.push([prevJSUTCDate, minVal], [currentJSUTCDate, minVal]);
    }

    // Add the up month/down month data to the chart's series
    hcChartObj.series[1].setData(upSeriesData, false);
    hcChartObj.series[2].setData(downSeriesData, false);

    hcChartObj.yAxis[0].setExtremes(dataRanges.dataMin, dataRanges.dataMax, true, false);

    this.ui.updateHeight();
  };

  // Defines the HighCharts configuration options.
  AppClass.prototype.getBaselineOptions = function() {
    return {
      chart: {
        borderColor: 'rgba(255, 255, 255, 0.0)',
        borderRadius: 0,
        defaultSeriesType: 'line',
        renderTo: this.chartContainer,
        spacingBottom: 25,
        spacingLeft: 1,
        spacingRight: 1,
        backgroundColor: this.chartStyles.backgroundColor
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
          lineWidth: this.chartStyles.lineWidth
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
        color: this.chartStyles.lineColor,
        name: 'Close price'
      }, {
        color: this.chartStyles.greenBar,
        lineWidth: 6,
        name: 'Up months'
      }, {
        color: this.chartStyles.redBar,
        lineWidth: 6,
        name: 'Down months'
      }],
      title: {
        align: 'left',
        style: {
          color: '#666',
          fontFamily: this.chartStyles.fontFamily,
          fontSize: 14,
          fontWeight: 'bold',
          lineHeight: this.chartStyles.lineHeight
        }
      },
      tooltip: {
        borderRadius: 1,
        crosshairs: true,
        formatter: function() {
          if (this.series.name === 'Close price') {
            return '<div style="color: #777777; font-size: 12px;">' + Highcharts.dateFormat('%b %e %Y', this.x) + ': $' + Highcharts.numberFormat(this.y, 2) + '</div>';
          }

          return false;
        },
        style: {
          color: this.chartStyles.fontColor,
          fontFamily: this.chartStyles.fontFamily,
          fontSize: this.chartStyles.fontSize,
          lineHeight: this.chartStyles.lineHeight,
          padding: this.chartStyles.fontSize
        }
      },
      xAxis: [{
        // Bottom datetime axis (short intervals)
        dateTimeLabelFormats: {
          minute: '%l:%M%P',
          hour: '%l%P',
          day: '%b %e',
          week: '%b %e',
          month: '%b',
          year: '%Y'
        },
        gridLineDashStyle: 'shortdot',
        gridLineColor: this.chartStyles.gridAltColor,
        gridLineWidth: 1,
        labels: {
          align: 'left',
          style: {
            color: this.chartStyles.fontColor,
            fontFamily: this.chartStyles.fontFamily,
            fontSize: this.chartStyles.fontSize
          },
          x: this.chartStyles.fontSize / 2,
          y: this.chartStyles.fontSize * this.chartStyles.lineHeight * 1.5
        },
        lineColor: this.chartStyles.gridColor,
        tickColor: this.chartStyles.gridColor,
        tickInterval: MS_MONTH,
        tickLength: this.chartStyles.fontSize * this.chartStyles.lineHeight * 1.5,
        type: 'datetime'
      }, {
        // Top datetime axis (longer intervals)
        dateTimeLabelFormats: {
          day: '%a',
          week: '%a',
          month: '%b %Y',
          year: '%Y'
        },
        gridLineWidth: 1,
        gridLineColor: this.chartStyles.gridColor,
        labels: {
          align: 'left',
          style: {
            color: this.chartStyles.fontColor,
            fontFamily: this.chartStyles.fontFamily,
            fontSize: this.chartStyles.fontSize
          },
          x: this.chartStyles.fontSize / 2
        },
        lineColor: this.chartStyles.gridColor,
        linkedTo: 0,
        opposite: true,
        tickColor: this.chartStyles.gridColor,
        tickInterval: MS_YEAR,
        tickLength: this.chartStyles.fontSize * this.chartStyles.lineHeight,
        type: 'datetime'
      }],
      yAxis: [{
        gridLineColor: this.chartStyles.gridColor,
        labels: {
          align: 'left',
          formatter: function() {
            return Highcharts.numberFormat(this.value, 2);
          },
          style: {
            color: this.chartStyles.fontColor,
            fontFamily: this.chartStyles.fontFamily,
            fontSize: this.chartStyles.fontSize
          },
          x: 0,
          y: (this.chartStyles.fontSize + 3)
        },
        maxPadding: 0,
        minPadding: 0,
        opposite: true,
        showFirstLabel: false,
        tickColor: this.chartStyles.gridColor,
        // Cropped at left of chart
        tickLength: 100,
        tickWidth: 1,
        title: {
          text: ''
        }
      }]
    };
  };

  return AppClass;

})();
