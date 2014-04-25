define('testHelpers', ['F2'], function(F2) {

	var oneTimeToken = F2.onetimeToken();

	return {
		easyLoad: function(appIds, completeFn) {
			appIds = [].concat(appIds);
			var appConfigs = [];

			for (var i = 0; i < appIds.length; i++) {
				appConfigs.push({
					appId: appIds[i],
					manifestUrl: '/apps/single'
				});
			}

			return F2.load({
				appConfigs: appConfigs,
				complete: completeFn
			});
		},
		containerToken: oneTimeToken
	};

});
