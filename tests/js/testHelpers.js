define('testHelpers', ['F2'], function(F2) {

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
		}
	};

});
