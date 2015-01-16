/* global angular, moment */

(function() {

  var QUOTE_API_URL = 'http://dev.markitondemand.com/Api/Quote/:action';

  // Maximum number of symbols to be compared in the tool
  var MAX_SYMBOLS = 5;

  var DATA_POINTS = [{
    label: 'Last Price',
    field: 'LastPrice',
    format: 'currency'
  }, {
    label: 'High',
    field: 'High',
    format: 'currency'
  }, {
    label: 'Low',
    field: 'Low',
    format: 'currency'
  }, {
    label: 'Open',
    field: 'Open',
    format: 'currency'
  }, {
    label: 'Market Cap',
    field: 'MarketCap',
    format: 'number'
  }, {
    label: 'Volume',
    field: 'Volume',
    format: 'number'
  }, {
    label: 'Change',
    field: 'Change',
    format: 'currency'
  }, {
    label: 'Change %',
    field: 'ChangePercent',
    format: 'percent:2'
  }, {
    label: 'Change YTD',
    field: 'ChangeYTD',
    format: 'currency'
  }, {
    label: 'Change % YTD',
    field: 'ChangePercentYTD',
    format: 'percent:2'
  }, {
    label: 'Data Refreshed On',
    field: 'Timestamp',
    format: 'date'
  }];

  // Add a range of indexes to a collection
  // e.g., ng-repeat='indexes in [] | range:10'
  function rangeFilter() {
    return function(input, num) {
      for (var i = 0; i < num; i++) {
        input.push(i);
      }

      return input;
    };
  }

  function companyService($resource) {
    var defaultCallbacks = {
      success: function() {},
      error: function() {},
      complete: function() {}
    };

    return {
      getBySymbol: function(symbol, cbs) {
        cbs = angular.extend({}, defaultCallbacks, cbs);

        var query = $resource(QUOTE_API_URL, {
          action: 'jsonp',
          callback: 'JSON_CALLBACK',
          symbol: symbol
        }, {
          get: {
            method: 'jsonp'
          }
        });

        query.get(function(response) {
          if (response.Data) {
            cbs.success(response.Data);
          } else {
            cbs.error('Invalid symbol');
          }

          cbs.complete();
        }, function() {
          cbs.error();
          cbs.complete();
        });
      }
    };
  }

  function companyController($scope, $filter, companySvc) {

    // Define what data points will be displayed
    $scope.dataPoints = DATA_POINTS;

    // List of symbols we're comparing
    // Sample: http://dev.markitondemand.com/Api/Quote/jsonp?symbol=aapl
    $scope.issues = [];

    // Get the number of empty compare slots
    $scope.numRemaining = function() {
      return MAX_SYMBOLS - $scope.issues.length;
    };

    // Lookup the specified company
    $scope.addCompany = function(ticker) {
      if ($scope.issues.length < MAX_SYMBOLS) {
        var self = this;

        // Use THIS instead of $scope, because we're actually in the scope
        // of the clicked dom element
        self.isLoading = true;

        // Grab the symbol data from the service
        companySvc.getBySymbol(ticker, {
          success: function(data) {
            $scope.issues.push(data);
            self.searchSymbol = '';
          },
          error: function(msg) {
            alert(msg || 'Sorry, that didn\'t work for some reason');
          },
          complete: function() {
            self.isLoading = false;
          }
        });
      } else {
        alert('You\'re already comparing the maximum number of companies');
      }
    };

    // Pull the company out of comparison
    $scope.removeCompany = function(ticker) {
      for (var i = 0; i < $scope.issues.length; i++) {
        if ($scope.issues[i].Symbol === ticker) {
          $scope.issues.splice(i, 1);
          break;
        }
      }
    };

    // Multi-purpose format func
    $scope.format = function(value, type) {
      var out = value;

      if (type) {
        var params = type.split(':');
        type = params[0];

        switch (type) {
          case 'percent':
            out = value.toFixed(params[1] || 0) + '%';
            break;
          case 'number':
            out = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            break;
          case 'date':
            out = moment(value).format('M/DD/YYYY h:mm:ss A');
            break;
          default:
            // Use the default angular filter
            out = $filter(type)(value);
            break;
        }
      }

      return out;
    };
  }

  // Register the angular modules
  angular.module('filters', []).filter('range', rangeFilter);
  angular.module('services', ['ngResource']).service('companySvc', companyService);
  angular.module('compareTool', ['filters', 'services']).controller('CompareCtrl', companyController);

})();
