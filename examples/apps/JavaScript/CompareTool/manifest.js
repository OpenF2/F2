F2_jsonpCallback_com_openf2_examples_javascript_compareTool({
	"scripts":[
		"../apps/JavaScript/CompareTool/js/angular.min.js",
		"../apps/JavaScript/CompareTool/js/angular-resource.min.js",
		"../apps/JavaScript/CompareTool/js/moment.min.js",
		"../apps/JavaScript/CompareTool/js/compare.js",
		"../apps/JavaScript/CompareTool/appclass.js"
	],
	"styles":[
		"../apps/JavaScript/CompareTool/css/compare.css"
	],
	"apps":[
		{
			"html": [
				'<div class="compare" ng-controller="CompareCtrl">',
					'<p>',
						'Examples: ',
						'<span ng-repeat="symbol in [\'aapl\', \'tsla\', \'mmm\', \'dis\', \'amzn\']">',
							'<a href="javascript:;" ng-click="addCompany(symbol)">{{symbol | uppercase}}</a>{{$last && " " || ", "}}',
						'</span>',
					'</p>',
					'<table class="table table-striped table-condensed">',
						'<thead>',
							'<tr>',
								'<th></th>',
								'<th ng-repeat="issue in issues">',
									'{{issue.Name}}',
									'<span>{{issue.Symbol}}</span>',
									'<a href="javascript:;" ng-click="removeCompany(issue.Symbol)">Remove</a>',
								'</th>',
								'<th ng-repeat="issue in [] | range:numRemaining()">',
									'<form ng-submit="addCompany(searchSymbol)">',
										'<input type="text" name="searchSymbol" class="" placeholder="Enter symbol..." ng-model="searchSymbol" ng-class="{loading: this.isLoading}" required />',
										'<input type="submit" value="Compare" class="btn btn-default btn-sm" />',
									'</form>',
								'</th>',
							'</tr>',
						'</thead>',
						'<tbody>',
							'<tr ng-repeat="point in dataPoints">',
								'<td>{{point.label}}</td>',
								'<td ng-repeat="issue in issues">{{format(issue[point.field], point.format)}}</td>',
								'<td ng-repeat="issue in [] | range:numRemaining()"></td>',
							'</tr>',
						'</tbody>',
					'</table>',
					'<p class="text-light gap-top">Quotes provided by <a href="http://dev.markitondemand.com/#stockquote" target="_blank">http://dev.markitondemand.com/</a></p>',
				'</div>'
			].join('')
		}
	]
});