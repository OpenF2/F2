describe('AMD', function() {

	require.config({
		f2: {
			appConfigs: [
				{
					appId: TEST_APP_ID,
					manifestUrl: TEST_MANIFEST_URL
				},
				{
					appId: TEST_BATCH_APP_ID,
					manifestUrl: TEST_BATCH_MANIFEST_URL,
					enableBatchRequests: true
				}
			]
		}
	});

	// Helper function to add an app's html and root to the DOM
	function addAppToPage(id, appConfig, appHtml) {
		var testNode = document.createElement("div");
		testNode.id = id;
		testNode.innerHTML += appHtml;
		document.body.appendChild(testNode);
		appConfig.root = testNode;
	}

	it('should locally define F2', function() {
		require(["../sdk/f2.min.js"], function(nonGlobalF2) {
			isLoaded = typeof nonGlobalF2 !== "undefined";
			runs(function() { });
		});
	});

	it('should not throw with a valid appId', function() {
		expect(function() {
			var hasApp = false;

			require(["F2App!com_test_single"], function(app) {
				hasApp = (app != null);
			});

			waitsFor(function() {
				return hasApp;
			}, 1000);
		}).not.toThrow();
	});

	it('should error with invalid appIds', function() {
		var error;

		require(["F2App!not_an_id"], function(e) {
			error = e.error;
		});

		waitsFor(function() {
			return !!error;
		}, 1000);

		runs(function() {
			expect(error).not.toBeNull();
		});
	});

	it('should load an F2 app and call APP_RENDER', function() {
		var appRenderRun = false;

		runs(function() {
			require(["F2App!com_test_single"], function(app) {
				app.APP_RENDER(function(appConfig, appHtml) {
					addAppToPage("testing123", appConfig, appHtml);
					appRenderRun = true;
				});
			});
		});

		// Wait for APP_RENDER to run
		waitsFor(function() {
			return appRenderRun;
		}, 1000);

		// Make sure we added it to the page
		runs(function() {
			expect(document.getElementById("testing123")).not.toBeNull();
		});
	});

	it('should load multiple instances of the same appId', function() {
		var instanceIdOne, instanceIdTwo;

		require(["F2App!com_test_batchable", "F2App!com_test_batchable"], function(one, two) {
			one.APP_RENDER(function(appConfig, appHtml) {
				addAppToPage("testing123", appConfig, appHtml);
				instanceIdOne = appConfig.instanceId;
			});

			two.APP_RENDER(function(appConfig, appHtml) {
				addAppToPage("testing456", appConfig, appHtml);
				instanceIdTwo = appConfig.instanceId;
			});
		});

		waitsFor(function() {
			var oneExists = document.getElementById("testing123") != null;
			var twoExists = document.getElementById("testing456") != null;
			var diffIds = instanceIdOne != instanceIdTwo;
			return oneExists && twoExists && diffIds;
		}, 3000);
	});

});