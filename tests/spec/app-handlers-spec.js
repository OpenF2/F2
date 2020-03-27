describe('F2.AppHandlers', function () {

	var containerAppHandlerToken = null;

	beforeEachReloadF2(function () {
		if (F2.AppHandlers.getToken) {
			containerAppHandlerToken = F2.AppHandlers.getToken();
		}
	});

	var appConfig = function () {
		return {
			appId: TEST_APP_ID,
			manifestUrl: TEST_MANIFEST_URL
		};
	};

	var appManifest = function () {
		return {
			scripts: [],
			styles: [],
			inlineScripts: [],
			apps: [
				{
					html: '<div class="test-app">Testing</div>'
				}
			]
		}
	};

	// TODO: remove for v2
	xit('should fire beforeAppRender, appRender, or afterAppRender if they are defined in container config and not APP_RENDER_* AppHandler methods.',
		function () {
			var isBeforeAppRenderFired = false;

			F2.init({
				beforeAppRender: function () {
					isBeforeAppRenderFired = true;
				}
			});

			F2.AppHandlers
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER_BEFORE,
					function (appConfig) {
						throw ("I should not fire!");
					}
				)
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER,
					function (appConfig) {
						throw ("I should not fire!");
					}
				)
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER_AFTER,
					function (appConfig) {
						throw ("I should not fire!");
					}
				);

			F2.registerApps(appConfig(), appManifest());

			waitsFor(
				function () {
					return isBeforeAppRenderFired;
				},
				'beforeAppRender was never fired',
				3000
			);

			runs(function () { expect(isBeforeAppRenderFired).toBeTruthy(); });
		}
	);

	//TODO: remove for v2
	xit(
		'should fire app handlers if beforeAppRender, appRender, and afterAppRender are NOT defined in container config',
		function () {
			var isAppRenderBeforeFired = false;

			F2.init();

			F2.AppHandlers.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_BEFORE,
				function (appConfig) {
					setTimeout(function () { isAppRenderBeforeFired = true }, 100);
				}
			).on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function (appConfig) {
					setTimeout(function () { isAppRenderBeforeFired = true }, 100);
				}
			);

			F2.registerApps(appConfig(), appManifest());

			waitsFor(
				function () {
					return isAppRenderBeforeFired;
				},
				'F2.AppHandlers.on("appRenderBefore") was never fired',
				3000
			);

			runs(function () { expect(isAppRenderBeforeFired).toBeTruthy(); });
		}
	);

	it('should not allow F2.AppHandlers.on() handler registration without valid token', function () {
		expect(function () {
			F2.init();

			F2.AppHandlers.on(
				"",
				F2.Constants.AppHandlers.APP_RENDER_BEFORE,
				function (appConfig) { }
			);

			F2.registerApps(appConfig(), appManifest());
		}).toThrow();
	});

	it('should not allow F2.AppHandlers.off() handler registration without valid token', function () {
		expect(function () {
			F2.init();

			F2.AppHandlers.off(
				"",
				F2.Constants.AppHandlers.APP_RENDER_BEFORE
			);

			F2.registerApps(appConfig(), appManifest());
		}).toThrow();
	});

	it('F2.AppHandlers.getToken() method should be destroyed after first call.', function () {
		// F2.AppHandlers.getToken is called above in the beforeEachReloadF2
		expect(F2.AppHandlers.getToken).toBeFalsy();
	});

	it('F2.AppHandlers.__f2GetToken() method should be destroyed after first call.', function () {
		// F2.AppHandlers.__f2GetToken is called internally and should no longer exist
		expect(F2.AppHandlers.__f2GetToken).toBeFalsy();
	});

	it('container should not be allowed to trigger F2.AppHandlers.on() events.', function () {
		expect(function () {
			F2.init();

			F2.AppHandlers.__trigger(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_BEFORE
			);
		}).toThrow();
	});

	it('F2.AppHandlers should not be required to load apps.', function () {
		expect(function () {
			F2.init();
			F2.registerApps(appConfig(), appManifest());
		}).not.toThrow();
	});

	it('render methods should fire sequentially', function (done) {
		var bDone = false;
		var sOrder = null;
		var arOrder = [];

		F2.init();

		// 1. appCreateRoot
		// 2. appRenderBefore
		// 3. appRender
		// 4. appRenderAfter
		F2.AppHandlers
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_CREATE_ROOT,
				function (appConfig) {
					appConfig.root = $("<div></div>").get(0);
					arOrder.push(F2.Constants.AppHandlers.APP_CREATE_ROOT);
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_BEFORE,
				function (appConfig) {
					arOrder.push(F2.Constants.AppHandlers.APP_RENDER_BEFORE);
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER,
				function (appConfig) {
					$("body").append($(appConfig.root));
					arOrder.push(F2.Constants.AppHandlers.APP_RENDER);
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function (appConfig) {
					arOrder.push(F2.Constants.AppHandlers.APP_RENDER_AFTER);
					sOrder = arOrder.join(",");

					expect(sOrder).toBe("appCreateRoot,appRenderBefore,appRender,appRenderAfter");
					done();
				}
			);

		F2.registerApps(appConfig(), appManifest());
	});
});

describe('F2.AppHandlers - rendering - appCreateRoot', function () {

	var containerAppHandlerToken = null;

	beforeEachReloadF2(function () {
		if (F2.AppHandlers.getToken) {
			containerAppHandlerToken = F2.AppHandlers.getToken();
		}
	});

	var appConfig = function () {
		return {
			appId: TEST_APP_ID,
			manifestUrl: TEST_MANIFEST_URL
		};
	};

	var appManifest = function () {
		return {
			scripts: [],
			styles: [],
			inlineScripts: [],
			apps: [
				{
					html: '<div class="test-app">Testing</div>'
				}
			]
		};
	};

	it(
		'should create appRoot using the apps html if appCreateRoot event is not bound and render appRoot to the page automatically.',
		function (done) {
			F2.init();

			F2.AppHandlers.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function (appConfig) {
					var $root = $(appConfig.root);
					expect($root.hasClass("test-app")).toBe(true);
					expect($root.parents("body:first").length > 0).toBe(true);
					expect($root.text() == "Testing").toBe(true);
					done();
				}
			);

			F2.registerApps(appConfig(), appManifest());
		}
	);

	it('should pass appConfig as only argument to appCreateRoot.', function (done) {
			F2.init();

			F2.AppHandlers.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_CREATE_ROOT,
				function (appConfig) {
					appConfig.root = $("<h1></h1>").get(0);
					var bHasAppConfig = (arguments.length == 1 && appConfig && appConfig.appId && appConfig.manifestUrl) ? true : false;
					expect(bHasAppConfig).toBe(true);
					done();
				}
			);

			F2.registerApps(appConfig(), appManifest());
		}
	);

	it(
		'respects appCreateRoot setting appConfig.root and appends app html by default.',
		function (done) {
			F2.init();

			F2.AppHandlers
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_CREATE_ROOT,
					function (appConfig) {
						appConfig.root = $("<h1></h1>").get(0);
					}
				)
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER_AFTER,
					function (appConfig) {
						var $root = $(appConfig.root);
						expect($root.is("h1")).toBe(true);
						expect($root.parents("body:first").length > 0).toBe(true);
						expect($root.find("div.test-app").length > 0).toBe(true);
						done();
					}
				);

			F2.registerApps(appConfig(), appManifest());
		}
	);

	it('fires appCreateRoot functions sequentially.', function (done) {
		var arOrder = [];
		F2.init();

		F2.AppHandlers
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_CREATE_ROOT,
				function (appConfig) {
					appConfig.root = $("<app></app>").get(0);
					arOrder.push("1");
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_CREATE_ROOT,
				function (appConfig) {
					arOrder.push("2");
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_CREATE_ROOT,
				function (appConfig) {
					arOrder.push("3");
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function (appConfig) {
					var $root = $(appConfig.root);
					expect(arOrder.join(",")).toBe("1,2,3");
					expect($root.is("app")).toBe(true);
					expect($root.parents("body:first").length > 0).toBe(true);
					expect($root.find("div.test-app").length > 0).toBe(true);
					done();
				}
			);

			F2.registerApps(appConfig(), appManifest());
		}
	);

	it('allows manipulation of appConfig.root through out appCreateRoot methods.', function (done) {
		var arOrder = [];

		F2.init();

		F2.AppHandlers
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_CREATE_ROOT,
				function (appConfig) {
					appConfig.root = $("<app></app>").get(0);
					arOrder.push("1");
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_CREATE_ROOT,
				function (appConfig) {
					$(appConfig.root).addClass("blue");
					arOrder.push("2");
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_CREATE_ROOT,
				function (appConfig) {
					$(appConfig.root).addClass("red").attr("data-test", "test");
					arOrder.push("3");
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function (appConfig) {
					var $root = $(appConfig.root);
					expect($root.hasClass("blue")).toBe(true);
					expect($root.hasClass("red")).toBe(true);
					expect(!!$root.attr("data-test")).toBe(true);
					expect(arOrder.join(",")).toBe("1,2,3");
					expect($root.is("app")).toBe(true);
					expect($root.parents("body:first").length > 0).toBe(true);
					expect($root.find("div.test-app").length > 0).toBe(true);
					done();
				}
			);

			F2.registerApps(appConfig(), appManifest());
		}
	);

	it('allows resetting of appConfig.root.', function (done) {
		var arOrder = [];

		F2.init();

		F2.AppHandlers
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_CREATE_ROOT,
				function (appConfig) {
					appConfig.root = $("<app></app>").get(0);
					arOrder.push("1");
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_CREATE_ROOT,
				function (appConfig) {
					appConfig.root = $("<specialapp></specialapp>").get(0);
					arOrder.push("2");
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function (appConfig) {
					var $root = $(appConfig.root);
					expect(arOrder.join(",")).toBe("1,2");
					expect($root.is("specialapp")).toBe(true);
					expect($root.parents("body:first").length > 0).toBe(true);
					expect($root.find("div.test-app").length > 0).toBe(true);
					done();
				}
			);

			F2.registerApps(appConfig(), appManifest());
		}
	);
});

describe('F2.AppHandlers - rendering - appRenderBefore', function () {

	var containerAppHandlerToken = null;

	beforeEachReloadF2(function () {
		if (F2.AppHandlers.getToken) {
			containerAppHandlerToken = F2.AppHandlers.getToken();
		}
	});

	var appConfig = function () {
		return {
			appId: TEST_APP_ID,
			manifestUrl: TEST_MANIFEST_URL
		};
	};

	var appManifest = function () {
		return {
			scripts: [],
			styles: [],
			inlineScripts: [],
			apps: [
				{
					html: '<div class="test-app">Testing</div>'
				}
			]
		};
	};

	it('should pass appConfig as only argument to appRenderBefore.', function (done) {

			F2.init();

			F2.AppHandlers
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER_BEFORE,
					function (appConfig) {
						var bHasAppConfig = (arguments.length == 1 && appConfig && appConfig.appId && appConfig.manifestUrl) ? true : false;
						expect(bHasAppConfig).toBe(true);
						done();
					}
				);

			F2.registerApps(appConfig(), appManifest());
		}
	);

	it(
		'should create appRoot using the apps html if appCreateRoot event is not bound and render appRoot to the page automatically.',
		function (done) {
			F2.init();

			F2.AppHandlers.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function (appConfig) {
					var $root = $(appConfig.root);
					expect($root.hasClass("test-app")).toBe(true);
					expect($root.parents("body:first").length > 0).toBe(true);
					expect($root.text() == "Testing").toBe(true);
					done();
				}
			);

			F2.registerApps(appConfig(), appManifest());
		}
	);

	it(
		'respects appRenderBefore setting appConfig.root and appends app html by default.',
		function (done) {
			F2.init();

			F2.AppHandlers
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER_BEFORE,
					function (appConfig) {
						appConfig.root = $("<h1></h1>").get(0);
					}
				)
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER_AFTER,
					function (appConfig) {
						var $root = $(appConfig.root);
						expect($root.is("h1")).toBe(true);
						expect($root.parents("body:first").length > 0).toBe(true);
						expect($root.find("div.test-app").length > 0).toBe(true);
						done();
					}
				);

			F2.registerApps(appConfig(), appManifest());
		}
	);

	it('fires appRenderBefore functions sequentially.', function (done) {
			var arOrder = [];

			F2.init();

			F2.AppHandlers
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER_BEFORE,
					function (appConfig) {
						appConfig.root = $("<app></app>").get(0);
						arOrder.push("1");
					}
				)
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER_BEFORE,
					function (appConfig) {
						arOrder.push("2");
					}
				)
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER_BEFORE,
					function (appConfig) {
						arOrder.push("3");
					}
				)
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER_AFTER,
					function (appConfig) {
						var $root = $(appConfig.root);
						expect(arOrder.join(",")).toBe("1,2,3");
						expect($root.is("app")).toBe(true);
						expect($root.parents("body:first").length > 0).toBe(true);
						expect($root.find("div.test-app").length > 0).toBe(true);
						done();
					}
				);

			F2.registerApps(appConfig(), appManifest());
		}
	);

	it(
		'allows manipulation of appConfig.root through out appRenderBefore methods.',
		function (done) {
			var arOrder = [];

			F2.init();

			F2.AppHandlers
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER_BEFORE,
					function (appConfig) {
						appConfig.root = $("<app></app>").get(0);
						arOrder.push("1");
					}
				)
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER_BEFORE,
					function (appConfig) {
						$(appConfig.root).addClass("blue");
						arOrder.push("2");
					}
				)
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER_BEFORE,
					function (appConfig) {
						$(appConfig.root).addClass("red").attr("data-test", "test");
						arOrder.push("3");
					}
				)
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER_AFTER,
					function (appConfig) {
						var $root = $(appConfig.root);
						expect($root.hasClass("blue")).toBe(true);
						expect($root.hasClass("red")).toBe(true);
						expect(!!$root.attr("data-test")).toBe(true);
						expect(arOrder.join(",")).toBe("1,2,3");
						expect($root.is("app")).toBe(true);
						expect($root.parents("body:first").length > 0).toBe(true);
						expect($root.find("div.test-app").length > 0).toBe(true);
						done();
					}
				);

			F2.registerApps(appConfig(), appManifest());
		}
	);

	it('allows resetting of appConfig.root.', function (done) {
			var arOrder = [];

			F2.init();

			F2.AppHandlers
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER_BEFORE,
					function (appConfig) {
						appConfig.root = $("<app></app>").get(0);
						arOrder.push("1");
					}
				)
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER_BEFORE,
					function (appConfig) {
						appConfig.root = $("<specialapp></specialapp>").get(0);
						arOrder.push("2");
					}
				)
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER_AFTER,
					function (appConfig) {
						var $root = $(appConfig.root);
						expect(arOrder.join(",")).toBe("1,2");
						expect($root.is("specialapp")).toBe(true);
						expect($root.parents("body:first").length > 0).toBe(true);
						expect($root.find("div.test-app").length > 0).toBe(true);
						done();
					}
				);

			F2.registerApps(appConfig(), appManifest());
		}
	);

});

describe('F2.AppHandlers - rendering - appRender', function () {

	var containerAppHandlerToken = null;

	beforeEachReloadF2(function () {
		if (F2.AppHandlers.getToken) {
			containerAppHandlerToken = F2.AppHandlers.getToken();
		}
	});

	var appConfig = function () {
		return {
			appId: TEST_APP_ID,
			manifestUrl: TEST_MANIFEST_URL
		};
	};

	var appManifest = function () {
		return {
			scripts: [],
			styles: [],
			inlineScripts: [],
			apps: [
				{
					html: '<div class="test-app">Testing</div>'
				}
			]
		};
	};

	it(
		'should pass appConfig and html as only arguments to appRender.',
		function (done) {
			F2.init();

			F2.AppHandlers
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_CREATE_ROOT,
					function (appConfig) {
						appConfig.root = $("<div></div>").get(0);
					}
				)
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER,
					function (appConfig, html) {
						$('body').append($(appConfig.root).append(html));

						var bHasAppConfig = (arguments.length == 2 && appConfig && appConfig.appId && appConfig.manifestUrl) ? true : false;
						var bHasHtml = (arguments.length == 2 && html && typeof (html) === "string") ? true : false;

						expect(bHasAppConfig).toBe(true);
						expect(bHasHtml).toBe(true);

						done();
					}
				);

			F2.registerApps(appConfig(), appManifest());
		}
	);

	it(
		'should automatically create appRoot from app html and add app to the page if no appRender method is bound.',
		function (done) {
			var bDone = false;
			var bRootOnPage = false;
			var bAppIsRoot = false;
			var bAppHtmlInRoot = false;

			F2.init();

			F2.AppHandlers
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER_AFTER,
					function (appConfig) {
						var $root = $(appConfig.root);

						expect($root.parents("body:first").length > 0).toBe(true);
						expect($root.hasClass("test-app")).toBe(true);
						expect($root.text() == "Testing").toBe(true);
						done();
					}
				);

			F2.registerApps(appConfig(), appManifest());
		}
	);

	it(
		'respects appRender appending html and putting it on the page manually.',
		function (done) {
			$("div.app-area").remove();
			$("<div class='app-area'></div>").appendTo("body");

			F2.init();

			F2.AppHandlers
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_CREATE_ROOT,
					function (appConfig) {
						appConfig.root = $("<app></app>").get(0);
					}
				)
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER,
					function (appConfig, html) {
						var $root = $(appConfig.root);
						$root.append(html);

						$("body div.app-area:first").append($root);
					}
				)
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER_AFTER,
					function (appConfig) {
						var $root = $(appConfig.root);

						expect($root.is("app")).toBe(true);
						expect($root.parents("body:first").length > 0).toBe(true);
						expect($root.parent().is("div.app-area")).toBe(true);
						expect($root.find("div.test-app").length > 0).toBe(true);
						done();
					}
				);

			F2.registerApps(appConfig(), appManifest());
		}
	);

	it(
		'allows dom node to be only argument to appRender. Which renders the app to the dom node.',
		function (done) {
			// append a placeholder for the app
			$("<div class='app-area'></div>").appendTo("body");

			F2.init();

			F2.AppHandlers
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_CREATE_ROOT,
					function (appConfig) {
						appConfig.root = $("<app></app>").get(0);
					}
				)
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER,
					$("div.app-area:last").get(0)
				)
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER_AFTER,
					function (appConfig) {
						var $root = $(appConfig.root);

						expect($root.is("app")).toBe(true);
						expect($root.parents("body:first").length > 0).toBe(true);
						expect($root.parent().is("div.app-area")).toBe(true);
						expect($root.find("div.test-app").length > 0).toBe(true);

						$("div.app-area").remove();

						done();
					}
				);

			F2.registerApps(appConfig(), appManifest());
		}
	);

	it(
		'should allow dom node to be only argument to appRender. Which renders the app to the dom node without needing to specifiy appCreateRoot handler.',
		function (done) {
			// append a placeholder for the app
			$("<div class='app-area'></div>").appendTo("body");

			F2.init();

			F2.AppHandlers
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER,
					$("div.app-area:last").get(0)
				)
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER_AFTER,
					function (appConfig) {
						var $root = $(appConfig.root);

						expect($root.parents("body:first").length > 0).toBe(true);
						expect($root.parent().is("div.app-area")).toBe(true);
						expect($root.hasClass("test-app")).toBe(true);

						$("div.app-area").remove();

						done();
					}
				);

			F2.registerApps(appConfig(), appManifest());
		}
	);

	it(
		'fires appRender functions sequentially.',
		function (done) {
			var arOrder = [];

			// append a placeholder for the app
			$("<div class='app-area'></div>").appendTo("body");

			F2.init();

			F2.AppHandlers
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_CREATE_ROOT,
					function (appConfig) {
						appConfig.root = $("<app></app>").get(0);
					}
				)
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER,
					function (appConfig) {
						arOrder.push("1");
					}
				)
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER,
					function (appConfig) {
						arOrder.push("2");
					}
				)
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER,
					$("div.app-area").get(0)
				)
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER,
					function (appConfig) {
						arOrder.push("3");
					}
				)
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER_AFTER,
					function (appConfig) {
						var $root = $(appConfig.root);

						expect(arOrder.join(",")).toBe("1,2,3");
						expect($root.is("app")).toBe(true);
						expect($root.parents("body:first").length > 0).toBe(true);
						expect($root.parent().is("div.app-area")).toBe(true);
						expect($root.find("div.test-app").length > 0).toBe(true);

						$("div.app-area").remove();

						done();
					}
				);

			F2.registerApps(appConfig(), appManifest());
		}
	);

	it(
		'allows manipulation of appConfig.root through out appRender methods.',
		function (done) {
			var arOrder = [];
			$("<div class='app-area'></div>").appendTo("body");

			F2.init();

			F2.AppHandlers
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_CREATE_ROOT,
					function (appConfig) {
						appConfig.root = $("<app></app>").get(0);
					}
				)
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER,
					function (appConfig) {
						arOrder.push("1");
					}
				)
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER,
					function (appConfig) {
						$(appConfig.root).addClass("blue");
						arOrder.push("2");
					}
				)
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER,
					$("div.app-area").get(0)
				)
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER,
					function (appConfig) {
						$(appConfig.root).addClass("red").attr("data-test", "test");
						arOrder.push("3");
					}
				)
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER_AFTER,
					function (appConfig) {
						var $root = $(appConfig.root);

						expect($root.hasClass("blue")).toBe(true);
						expect($root.hasClass("red")).toBe(true);
						expect(!!$root.attr("data-test")).toBe(true);
						expect(arOrder.join(",")).toBe("1,2,3");
						expect($root.is("app")).toBe(true);
						expect($root.parents("body:first").length > 0).toBe(true);
						expect($root.find("div.test-app").length > 0).toBe(true);
						expect($root.parent().is("div.app-area")).toBe(true);

						done();
					}
				);

			F2.registerApps(appConfig(), appManifest());
		}
	);

});

describe('F2.AppHandlers - rendering - appRenderAfter', function () {

	var containerAppHandlerToken = null;

	beforeEachReloadF2(function () {
		if (F2.AppHandlers.getToken) {
			containerAppHandlerToken = F2.AppHandlers.getToken();
		}
	});

	var appConfig = function () {
		return {
			appId: TEST_APP_ID,
			manifestUrl: TEST_MANIFEST_URL
		};
	};

	var appManifest = function () {
		return {
			scripts: [],
			styles: [],
			inlineScripts: [],
			apps: [
				{
					html: '<div class="test-app">Testing</div>'
				}
			]
		};
	};

	it(
		'should pass appConfig as only argument to appRenderAfter.',
		function (done) {
			F2.init();

			F2.AppHandlers
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER_AFTER,
					function (appConfig) {
						var bHasAppConfig = (arguments.length == 1 && appConfig && appConfig.appId && appConfig.manifestUrl) ? true : false;
						expect(bHasAppConfig).toBe(true);
						done();
					}
				);

			F2.registerApps(appConfig(), appManifest());
		}
	);

	it(
		'should fire appRenderAfter only after app is in dom.',
		function (done) {
			F2.init();

			F2.AppHandlers
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER_AFTER,
					function (appConfig) {
						var $root = $(appConfig.root);

						expect($root.parents("body:first").length > 0).toBe(true);
						expect($root.hasClass("test-app")).toBe(true);
						expect($root.text() == "Testing").toBe(true);
						done();
					}
				);

			F2.registerApps(appConfig(), appManifest());
		}
	);

	it(
		'fires appRenderAfter functions sequentially.',
		function (done) {
			var arOrder = [];

			F2.init();

			F2.AppHandlers
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER_AFTER,
					function (appConfig) {
						arOrder.push("1");
					}
				)
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER_AFTER,
					function (appConfig) {
						arOrder.push("2");
					}
				)
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER_AFTER,
					function (appConfig) {
						arOrder.push("3");
						var $root = $(appConfig.root);

						expect(arOrder.join(",")).toBe("1,2,3");
						expect($root.parents("body:first").length > 0).toBe(true);
						expect($root.text() == "Testing").toBe(true);
						done();
					}
				);

			F2.registerApps(appConfig(), appManifest());
		}
	);

});

describe('F2.AppHandlers - rendering - appDestroyBefore', function () {
	var containerAppHandlerToken = null;

	beforeEachReloadF2(function () {
		if (F2.AppHandlers.getToken) {
			containerAppHandlerToken = F2.AppHandlers.getToken();
		}
	});

	var appConfig = function () {
		return {
			appId: TEST_APP_ID,
			manifestUrl: TEST_MANIFEST_URL
		};
	};

	var appManifest = function () {
		return {
			scripts: [],
			styles: [],
			inlineScripts: [],
			apps: [
				{
					html: '<div class="test-app">Testing</div>'
				}
			]
		};
	};

	it(
		'should remove on() appDestroyBefore handlers regardless of namespace if no namespace passed to off() event.',
		function (done) {
			var bAppGone = false;
			var $root = null;
			var bAppDestroyOnMethodCalled = false;
			var bAppDestroyWithNamespaceOnMethodCalled = false;

			F2.init();

			F2.AppHandlers
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_DESTROY_BEFORE,
					function () {
						bAppDestroyOnMethodCalled = true;
					}
				)
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_DESTROY_BEFORE + ".specialNamespace",
					function () {
						bAppDestroyWithNamespaceOnMethodCalled = true;
					}
				)
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER_AFTER,
					function (appConfig) {
						$root = $(appConfig.root);

						F2.AppHandlers.off(containerAppHandlerToken, F2.Constants.AppHandlers.APP_DESTROY_BEFORE);
						F2.removeApp(appConfig.instanceId);

						expect($root.parent().length == 0).toBe(true);
						expect(bAppDestroyOnMethodCalled).toBe(false);
						expect(bAppDestroyWithNamespaceOnMethodCalled).toBe(false);
						done();
					}
				);

			F2.registerApps(appConfig(), appManifest());
		}
	);

	it(
		'should only remove on() from appDestroyBefore handlers if namespace matches what was passed to off() event.',
		function (done) {
			var bAppGone = false;
			var $root = null;
			var bAppDestroyOnMethodCalled = false;
			var bAppDestroyWithNamespaceOnMethodCalled = false;

			F2.init();

			F2.AppHandlers
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_DESTROY_BEFORE,
					function () {
						bAppDestroyOnMethodCalled = true;
					}
				)
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_DESTROY_BEFORE + ".specialNamespace",
					function () {
						bAppDestroyWithNamespaceOnMethodCalled = true;
					}
				)
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER_AFTER,
					function (appConfig) {
						$root = $(appConfig.root);

						F2.AppHandlers.off(containerAppHandlerToken, F2.Constants.AppHandlers.APP_DESTROY_BEFORE + ".specialNamespace");
						F2.removeApp(appConfig.instanceId);

						expect($root.parent().length == 0).toBe(true);
						expect(bAppDestroyOnMethodCalled).toBe(true);
						expect(bAppDestroyWithNamespaceOnMethodCalled).toBe(false);
						done();
					}
				);

			F2.registerApps(appConfig(), appManifest());
		}
	);
});

describe('F2.AppHandlers - rendering - appDestroy', function () {

	var containerAppHandlerToken = null;

	beforeEachReloadF2(function () {
		containerAppHandlerToken = F2.AppHandlers.getToken();
	});

	var appConfig = function () {
		return {
			appId: TEST_APP_ID3,
			manifestUrl: TEST_MANIFEST_URL3
		};
	};

	var appManifest = function () {
		return {
			scripts: [],
			styles: [],
			inlineScripts: [],
			apps: [
				{
					html: '<div class="test-app">Testing</div>'
				}
			]
		};
	};

	it('should remove app from page if no appHandlers are declared.', function (done) {
		F2.init();

		F2.AppHandlers.on(
			containerAppHandlerToken,
			F2.Constants.AppHandlers.APP_RENDER_AFTER,
			function (appConfig) {
				$root = $(appConfig.root);

				expect($root.parent().length).toEqual(1);

				// delay execution of removing the app
				setTimeout(function () {
					F2.removeApp(appConfig.instanceId);
				}, 0);

				// delay execution to test that the app is now gone
				setTimeout(function () {
					expect($root.parent().length).toEqual(0);
					done();
				}, 600);
			}
		);

		F2.registerApps(appConfig(), appManifest());
	});

	it('should call app instance .destroy() method if destory method exists.', function (done) {
		F2.destroyAppMethodCalled = false;

		F2.init();

		var instanceConfig;

		// grab the appConfig which contains the instanceId required to remove it
		F2.AppHandlers.on(
			containerAppHandlerToken,
			F2.Constants.AppHandlers.APP_RENDER_AFTER,
			function (appConfig) {
				instanceConfig = appConfig;
			}
		);

		// wait for the app to have been created
		F2.Events.on('com_openf2_examples_nodejs_helloworld-init', function() {
			// delay execution of removing the app
			setTimeout(function () {
				F2.removeApp(instanceConfig.instanceId);
			}, 0);

			// delay execution to test that the app is now gone
			setTimeout(function () {
				expect(F2.destroyAppMethodCalled).toBe(true);
				done();
			}, 1000);
		});

		F2.registerApps(appConfig());
	});

	it(
		'should remove on() appDestroy handlers regardless of namespace if no namespace passed to off() event.',
		function (done) {
			var bAppGone = false;
			var $root = null;
			var bAppDestroyOnMethodCalled = false;
			var bAppDestroyWithNamespaceOnMethodCalled = false;

			F2.init();

			F2.AppHandlers
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_DESTROY,
					function (appConfig) {
						bAppDestroyOnMethodCalled = true;
					}
				)
				.on(
					containerAppHandlerToken,
					"appDestroy.specialNamespace",
					function (appConfig) {
						bAppDestroyWithNamespaceOnMethodCalled = true;
					}
				)
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER_AFTER,
					function (appConfig) {
						$root = $(appConfig.root);

						F2.AppHandlers.off(containerAppHandlerToken, F2.Constants.AppHandlers.APP_DESTROY);
						F2.removeApp(appConfig.instanceId);

						expect($root.parent().length == 0).toBe(true);
						expect(bAppDestroyOnMethodCalled).toBe(false);
						expect(bAppDestroyWithNamespaceOnMethodCalled).toBe(false);
						done();
					}
				);

			F2.registerApps(appConfig(), appManifest());
		}
	);

	it(
		'should only remove on() from appDestroy handlers if namespace matches what was passed to off() event.',
		function (done) {
			var bAppGone = false;
			var $root = null;
			var bAppDestroyOnMethodCalled = false;
			var bAppDestroyWithNamespaceOnMethodCalled = false;

			F2.init();

			F2.AppHandlers
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_DESTROY,
					function (appInstance) {
						// call the apps destroy method, if it has one
						if (appInstance && appInstance.app && appInstance.app.destroy && typeof (appInstance.app.destroy) == "function") {
							appInstance.app.destroy();
						}
						// warn the container developer/app developer that even though they have a destroy method it hasn't been
						else if (appInstance && appInstance.app && appInstance.app.destroy) {
							F2.log(app.config.appId + " has a destroy property, but destroy is not of type function and as such will not be executed.");
						}

						// fade out and remove the root
						jQuery(appInstance.config.root).fadeOut(250, function () {
							jQuery(this).remove();
						});

						bAppDestroyOnMethodCalled = true;
					}
				)
				.on(
					containerAppHandlerToken,
					"appDestroy.specialNamespace",
					function (appConfig) {
						bAppDestroyWithNamespaceOnMethodCalled = true;
					}
				)
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER_AFTER,
					function (appConfig) {
						$root = $(appConfig.root);

						F2.AppHandlers.off(containerAppHandlerToken, "appDestroy.specialNamespace");
						F2.removeApp(appConfig.instanceId);

						expect($root.parent().length == 0).toBe(true);
						expect(bAppDestroyOnMethodCalled).toBe(true);
						expect(bAppDestroyWithNamespaceOnMethodCalled).toBe(false);
						done();
					}
				);

			F2.registerApps(appConfig(), appManifest());
		}
	);
});

describe('F2.AppHandlers - rendering - appDestroyAfter', function () {
	var containerAppHandlerToken = null;

	beforeEachReloadF2(function () {
		if (F2.AppHandlers.getToken) {
			containerAppHandlerToken = F2.AppHandlers.getToken();
		}
	});

	var appConfig = function () {
		return {
			appId: TEST_APP_ID,
			manifestUrl: TEST_MANIFEST_URL
		};
	};

	var appManifest = function () {
		return {
			scripts: [],
			styles: [],
			inlineScripts: [],
			apps: [
				{
					html: '<div class="test-app">Testing</div>'
				}
			]
		};
	};

	it(
		'should remove on() appDestroyAfter handlers regardless of namespace if no namespace passed to off() event.',
		function (done) {
			var $root = null;
			var bAppDestroyOnMethodCalled = false;
			var bAppDestroyWithNamespaceOnMethodCalled = false;

			F2.init();

			F2.AppHandlers
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_DESTROY_AFTER,
					function () {
						bAppDestroyOnMethodCalled = true;
					}
				)
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_DESTROY_AFTER + ".specialNamespace",
					function () {
						bAppDestroyWithNamespaceOnMethodCalled = true;
					}
				)
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER_AFTER,
					function (appConfig) {
						$root = $(appConfig.root);

						F2.AppHandlers.off(containerAppHandlerToken, F2.Constants.AppHandlers.APP_DESTROY_AFTER);
						F2.removeApp(appConfig.instanceId);

						expect($root.parent().length == 0).toBe(true);
						expect(bAppDestroyOnMethodCalled).toBe(false);
						expect(bAppDestroyWithNamespaceOnMethodCalled).toBe(false);
						done();
					}
				);

			F2.registerApps(appConfig(), appManifest());
		}
	);

	it(
		'should only remove on() from appDestroyAfter handlers if namespace matches what was passed to off() event.',
		function () {
			var $root = null;
			var bAppDestroyOnMethodCalled = false;
			var bAppDestroyWithNamespaceOnMethodCalled = false;

			F2.init();

			F2.AppHandlers
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_DESTROY_AFTER,
					function () {
						bAppDestroyOnMethodCalled = true;
					}
				)
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_DESTROY_AFTER + ".specialNamespace",
					function () {
						bAppDestroyWithNamespaceOnMethodCalled = true;
					}
				)
				.on(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER_AFTER,
					function (appConfig) {
						$root = $(appConfig.root);

						F2.AppHandlers.off(containerAppHandlerToken, F2.Constants.AppHandlers.APP_DESTROY_AFTER + ".specialNamespace");
						F2.removeApp(appConfig.instanceId);

						expect($root.parent().length == 0).toBe(true);
						expect(bAppDestroyOnMethodCalled).toBe(true);
						expect(bAppDestroyWithNamespaceOnMethodCalled).toBe(false);
					}
				);

			F2.registerApps(appConfig(), appManifest());
		}
	);

});

describe('F2.AppHandlers - error handling - appScriptLoadFailed', function () {

	var containerAppHandlerToken = null;

	beforeEachReloadF2(function () {
		if (F2.AppHandlers.getToken) {
			containerAppHandlerToken = F2.AppHandlers.getToken();
		}
	});

	var appConfig = function () {
		return {
			appId: TEST_APP_ID,
			manifestUrl: TEST_MANIFEST_URL
		};
	};

	var appManifest = function () {
		return {
			scripts: ['https://www.openf2.org/foobar.js'],
			styles: [],
			inlineScripts: [],
			apps: [
				{
					html: '<div class="test-app">Testing</div>'
				}
			]
		};
	};

	var invalidInlineAppManifest = appManifest();
	invalidInlineAppManifest.scripts = [];
	invalidInlineAppManifest.inlineScripts = ['1alert("a");'];

	it(
		'handler should receive appScriptLoadFailed event due to invalid appjs path',
		function (done) {
			// Reduce timeout so this unit test doesn't take 7 seconds
			F2.init({ scriptErrorTimeout: 100 });

			F2.AppHandlers.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_SCRIPT_LOAD_FAILED,
				function (appConfig, scriptInfo) {
					F2.AppHandlers.off(containerAppHandlerToken, F2.Constants.AppHandlers.APP_SCRIPT_LOAD_FAILED);
					F2.removeApp(appConfig.instanceId);
					expect(true).toBe(true); // making it this far means the test succeeded
					done();
				}
			);

			F2.registerApps(appConfig(), appManifest());
		}
	);

	it(
		'handler should receive appScriptLoadFailed event due to invalid inline script',
		function (done) {
			F2.init();

			F2.AppHandlers.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_SCRIPT_LOAD_FAILED,
				function (appConfig, scriptInfo) {
					bScriptLoadFailedReceived = true;
					F2.AppHandlers.off(containerAppHandlerToken, F2.Constants.AppHandlers.APP_SCRIPT_LOAD_FAILED);
					F2.removeApp(appConfig.instanceId);
					expect(true).toBe(true); // making it this far means the test succeeded
					done();
				}
			);

			F2.registerApps(appConfig(), invalidInlineAppManifest);
		}
	);
});
