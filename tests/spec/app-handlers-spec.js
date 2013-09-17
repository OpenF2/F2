describe('F2.AppHandlers', function() {
	
	var containerAppHandlerToken = null;
	
	var async = new AsyncSpec(this);
	async.beforeEachReloadF2(function() { if(F2.AppHandlers.getToken) { containerAppHandlerToken = F2.AppHandlers.getToken(); } });
	
	var appConfig = function()
	{
		return {
			appId: TEST_APP_ID,
			manifestUrl: TEST_MANIFEST_URL
		};
	};
	
	var appManifest = function()
	{
		return {
			scripts:[],
			styles:[],
			inlineScripts:[],
			apps:[
				{
					html: '<div class="test-app">Testing</div>'
				}
			]
		}
	};
	
	it(
		
		'should fire beforeAppRender, appRender, or afterAppRender if they are defined in container config and not APP_RENDER_* AppHandler methods.',
		function() {
			var isBeforeAppRenderFired = false;			
			
			F2.init({
				beforeAppRender: function()
				{
					isBeforeAppRenderFired = true;					
				}
			});
			
			F2.AppHandlers
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_BEFORE,
				function(appConfig)
				{			
					throw("I should not fire!");
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER,
				function(appConfig)
				{			
					throw("I should not fire!");
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function(appConfig)
				{			
					throw("I should not fire!");
				}
			);
			
			F2.registerApps(appConfig(), appManifest());				

			waitsFor(
				function()
				{
					return isBeforeAppRenderFired;
				},
				'beforeAppRender was never fired',
				3000
			);
			
			runs(function() { expect(isBeforeAppRenderFired).toBeTruthy(); });			
		}
	);
	
	it(
		'should fire app handlers if beforeAppRender, appRender, and afterAppRender are NOT defined in container config',
		function() {
			var isAppRenderBeforeFired = false;			
			
			F2.init();
			
			F2.AppHandlers.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_BEFORE,
				function(appConfig)
				{			
					setTimeout(function(){ isAppRenderBeforeFired = true}, 100);
				}
			).on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function(appConfig)
				{			
					setTimeout(function(){ isAppRenderBeforeFired = true}, 100);
				}
			);			

			F2.registerApps(appConfig(), appManifest());

			waitsFor(
				function()
				{
					return isAppRenderBeforeFired;
				},
				'F2.AppHandlers.on("appRenderBefore") was never fired',
				3000
			);
			
			runs(function() { expect(isAppRenderBeforeFired).toBeTruthy(); });
		}
	);
	
	it(
		'should not allow F2.AppHandlers.on() handler registration without valid token',
		function() {
			expect(function(){
				F2.init();
				
				F2.AppHandlers.on(
					"",
					F2.Constants.AppHandlers.APP_RENDER_BEFORE,
					function(appConfig) {}
				);
				
				F2.registerApps(appConfig(), appManifest());
			}).toThrow();			
		}
	);
	
	it(
		'should not allow F2.AppHandlers.off() handler registration without valid token',
		function() {
			expect(function(){
				F2.init();
				
				F2.AppHandlers.off(
					"",
					F2.Constants.AppHandlers.APP_RENDER_BEFORE
				);
				
				F2.registerApps(appConfig(), appManifest());
			}).toThrow();			
		}
	);
	
	it(
		'F2.AppHandlers.getToken() method should be destroyed after first call.',
		function() {
			// F2.AppHandlers.getToken is called above in the async.beforeEachReloadF2
			expect(F2.AppHandlers.getToken).toBeFalsy();
		}
	);
	
	it(
		'F2.AppHandlers.__f2GetToken() method should be destroyed after first call.',
		function() {
			// F2.AppHandlers.__f2GetToken is called internally and should no longer exist
			expect(F2.AppHandlers.__f2GetToken).toBeFalsy();			
		}
	);
	
	it(
		'container should not be allowed to trigger F2.AppHandlers.on() events.',
		function() {			
			expect(function(){
				F2.init();
				
				F2.AppHandlers.__trigger(
					containerAppHandlerToken,
					F2.Constants.AppHandlers.APP_RENDER_BEFORE					
				);
			}).toThrow();			
		}
	);
	
	it(
		'F2.AppHandlers should not be required to load apps.',
		function() {			
			expect(function(){
				F2.init();
				F2.registerApps(appConfig(), appManifest());
			}).not.toThrow();	
		}
	);
	
	it(
		'render methods should fire sequentially appCreateRoot, appRenderBefore, appRender, and then appRenderAfter.',
		function() {
			var bDone = false;
			var sOrder = null;
			var arOrder = [];
			
			F2.init();
			
			F2.AppHandlers
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_CREATE_ROOT,
				function(appConfig)
				{			
					appConfig.root = $("<div></div>").get(0);
					arOrder.push(F2.Constants.AppHandlers.APP_CREATE_ROOT);
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_BEFORE,
				function(appConfig)
				{			
					arOrder.push(F2.Constants.AppHandlers.APP_RENDER_BEFORE);
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER,
				function(appConfig)
				{			
					$("body").append($(appConfig.root));
					arOrder.push(F2.Constants.AppHandlers.APP_RENDER);
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function(appConfig)
				{
					arOrder.push(F2.Constants.AppHandlers.APP_RENDER_AFTER);
					sOrder = arOrder.join(",");
					bDone = true;
				}
			);
			
			F2.registerApps(appConfig(), appManifest());

			waitsFor(
				function()
				{
					return bDone;
				},
				'AppHandlers were never fired',
				3000
			);
			
			runs(function() { expect(sOrder).toBe("appCreateRoot,appRenderBefore,appRender,appRenderAfter"); });			
		}
	);
	
});

describe('F2.AppHandlers - rendering - appCreateRoot', function() {
	
	var containerAppHandlerToken = null;
	
	var async = new AsyncSpec(this);
	async.beforeEachReloadF2(function() { if(F2.AppHandlers.getToken) { containerAppHandlerToken = F2.AppHandlers.getToken(); } });
	
	var appConfig = function()
	{
		return {
			appId: TEST_APP_ID,
			manifestUrl: TEST_MANIFEST_URL
		};
	};
	
	var appManifest = function()
	{
		return {
			scripts:[],
			styles:[],
			inlineScripts:[],
			apps:[
				{
					html: '<div class="test-app">Testing</div>'
				}
			]
		};
	};
	
	it(
		'should create appRoot using the apps html if appCreateRoot event is not bound and render appRoot to the page automatically.',
		function() {
			var bDone = false;
			var bRootOnPage = false;
			var bAppHtmlInRoot = false;
			var bHasTestAppClass = false;
			
			F2.init();
			
			F2.AppHandlers
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function(appConfig)
				{
					var $root = $(appConfig.root);
					bRootOnPage = ($root.parents("body:first").length > 0);
					bHasTestAppClass = $root.hasClass("test-app");
					bAppHtmlInRoot = ($root.text() == "Testing");
					bDone = true;
				}
			);
			
			F2.registerApps(appConfig(), appManifest());

			waitsFor(
				function()
				{
					return bDone;
				},
				'AppHandlers.On( appRenderAfter ) was never fired',
				3000
			);
			
			runs(function() {				
				expect(bHasTestAppClass).toBe(true);
				expect(bRootOnPage).toBe(true);
				expect(bAppHtmlInRoot).toBe(true);
			});			
		}
	);
	
	it(
		'should pass appConfig as only argument to appCreateRoot.',
		function() {
			var bDone = false;			
			var bHasAppConfig = false;
			
			F2.init();
			
			F2.AppHandlers
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_CREATE_ROOT,
				function(appConfig)
				{
					appConfig.root = $("<h1></h1>").get(0);
					bHasAppConfig = (arguments.length == 1 && appConfig && appConfig.appId && appConfig.manifestUrl) ? true : false;
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function(appConfig)
				{
					bDone = true;
				}
			);
			
			F2.registerApps(appConfig(), appManifest());

			waitsFor(
				function()
				{
					return bDone;
				},
				'AppHandlers.On( appRenderAfter ) was never fired',
				3000
			);
			
			runs(function() {				
				expect(bHasAppConfig).toBe(true);
			});			
		}
	);
	
	it(
		'respects appCreateRoot setting appConfig.root and appends app html by default.',
		function() {
			var bDone = false;
			var bRootIsH1 = false;
			var bRootOnPage = false;			
			var bAppHtmlInRoot = false;
			
			F2.init();
			
			F2.AppHandlers
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_CREATE_ROOT,
				function(appConfig)
				{
					appConfig.root = $("<h1></h1>").get(0);		
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function(appConfig)
				{
					var $root = $(appConfig.root);					
					bRootIsH1 = $root.is("h1");
					bRootOnPage = ($root.parents("body:first").length > 0);					
					bAppHtmlInRoot = ($root.find("div.test-app").length > 0);
					bDone = true;
				}
			);
			
			F2.registerApps(appConfig(), appManifest());

			waitsFor(
				function()
				{
					return bDone;
				},
				'AppHandlers.On( appRenderAfter ) was never fired',
				3000
			);
			
			runs(function() { expect(bRootIsH1).toBe(true); expect(bRootOnPage).toBe(true); expect(bAppHtmlInRoot).toBe(true); });			
		}
	);
	
	it(
		'fires appCreateRoot functions sequentially.',
		function() {
			var bDone = false;
			var arOrder = [];
			var bRootIsApp = false;
			var bRootOnPage = false;			
			var bAppHtmlInRoot = false;
			
			F2.init();
			
			F2.AppHandlers
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_CREATE_ROOT,
				function(appConfig)
				{
					appConfig.root = $("<app></app>").get(0);
					arOrder.push("1");							
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_CREATE_ROOT,
				function(appConfig)
				{
					arOrder.push("2");
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_CREATE_ROOT,
				function(appConfig)
				{
					arOrder.push("3");					
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function(appConfig)
				{
					var $root = $(appConfig.root);					
					bRootIsApp = $root.is("app");
					bRootOnPage = ($root.parents("body:first").length > 0);					
					bAppHtmlInRoot = ($root.find("div.test-app").length > 0);
					bDone = true;
				}
			);
			
			F2.registerApps(appConfig(), appManifest());

			waitsFor(
				function()
				{
					return bDone;
				},
				'AppHandlers.On( appRenderAfter ) was never fired',
				3000
			);
			
			runs(function() {
				expect(arOrder.join(",")).toBe("1,2,3");
				expect(bRootIsApp).toBe(true);
				expect(bRootOnPage).toBe(true); 
				expect(bAppHtmlInRoot).toBe(true);
			});			
		}
	);
	
	it(
		'allows manipulation of appConfig.root through out appCreateRoot methods.',
		function() {
			var bDone = false;
			var arOrder = [];
			var bRootIsApp = false;
			var bRootOnPage = false;			
			var bAppHtmlInRoot = false;
			var bHasBlueClass = false;
			var bHasRedClass = false;
			var bHasTestAttr = false;
			
			F2.init();
			
			F2.AppHandlers
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_CREATE_ROOT,
				function(appConfig)
				{
					appConfig.root = $("<app></app>").get(0);
					arOrder.push("1");
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_CREATE_ROOT,
				function(appConfig)
				{
					$(appConfig.root).addClass("blue");
					arOrder.push("2");
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_CREATE_ROOT,
				function(appConfig)
				{
					$(appConfig.root).addClass("red").attr("data-test", "test");
					arOrder.push("3");					
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function(appConfig)
				{
					var $root = $(appConfig.root);					
					bRootIsApp = $root.is("app");
					bRootOnPage = ($root.parents("body:first").length > 0);					
					bAppHtmlInRoot = ($root.find("div.test-app").length > 0);
					bHasBlueClass = $root.hasClass("blue");
					bHasRedClass = $root.hasClass("red");
					bHasTestAttr = !!$root.attr("data-test");
					bDone = true;
				}
			);
			
			F2.registerApps(appConfig(), appManifest());

			waitsFor(
				function()
				{
					return bDone;
				},
				'AppHandlers.On( appRenderAfter ) was never fired',
				3000
			);
			
			runs(function() {
				expect(bHasBlueClass).toBe(true);
				expect(bHasRedClass).toBe(true); 
				expect(bHasTestAttr).toBe(true);
				expect(arOrder.join(",")).toBe("1,2,3");
				expect(bRootIsApp).toBe(true);
				expect(bRootOnPage).toBe(true); 
				expect(bAppHtmlInRoot).toBe(true);
			});			
		}
	);
	
	it(
		'allows resetting of appConfig.root.',
		function() {
			var bDone = false;
			var arOrder = [];
			var bRootIsApp = false;
			var bRootOnPage = false;			
			var bAppHtmlInRoot = false;
			
			F2.init();
			
			F2.AppHandlers
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_CREATE_ROOT,
				function(appConfig)
				{
					appConfig.root = $("<app></app>").get(0);
					arOrder.push("1");
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_CREATE_ROOT,
				function(appConfig)
				{
					appConfig.root = $("<specialapp></specialapp>").get(0);
					arOrder.push("2");
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function(appConfig)
				{
					var $root = $(appConfig.root);					
					bRootIsApp = $root.is("specialapp");
					bRootOnPage = ($root.parents("body:first").length > 0);					
					bAppHtmlInRoot = ($root.find("div.test-app").length > 0);					
					bDone = true;
				}
			);
			
			F2.registerApps(appConfig(), appManifest());

			waitsFor(
				function()
				{
					return bDone;
				},
				'AppHandlers.On( appRenderAfter ) was never fired',
				3000
			);
			
			runs(function() {				
				expect(arOrder.join(",")).toBe("1,2");
				expect(bRootIsApp).toBe(true);
				expect(bRootOnPage).toBe(true); 
				expect(bAppHtmlInRoot).toBe(true);
			});			
		}
	);

});

describe('F2.AppHandlers - rendering - appRenderBefore', function() {
	
	var containerAppHandlerToken = null;
	
	var async = new AsyncSpec(this);
	async.beforeEachReloadF2(function() { if(F2.AppHandlers.getToken) { containerAppHandlerToken = F2.AppHandlers.getToken(); } });
	
	var appConfig = function()
	{
		return {
			appId: TEST_APP_ID,
			manifestUrl: TEST_MANIFEST_URL
		};
	};
	
	var appManifest = function()
	{
		return {
			scripts:[],
			styles:[],
			inlineScripts:[],
			apps:[
				{
					html: '<div class="test-app">Testing</div>'
				}
			]
		};
	};
	
	it(
		'should pass appConfig as only argument to appRenderBefore.',
		function() {
			var bDone = false;			
			var bHasAppConfig = false;
			
			F2.init();
			
			F2.AppHandlers
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_BEFORE,
				function(appConfig)
				{					
					bHasAppConfig = (arguments.length == 1 && appConfig && appConfig.appId && appConfig.manifestUrl) ? true : false;
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function(appConfig)
				{
					bDone = true;
				}
			);
			
			F2.registerApps(appConfig(), appManifest());

			waitsFor(
				function()
				{
					return bDone;
				},
				'AppHandlers.On( appRenderAfter ) was never fired',
				3000
			);
			
			runs(function() {				
				expect(bHasAppConfig).toBe(true);
			});			
		}
	);
	
	it(
		'should create appRoot using the apps html if appCreateRoot event is not bound and render appRoot to the page automatically.',
		function() {
			var bDone = false;
			var bRootOnPage = false;
			var bAppHtmlInRoot = false;
			var bHasTestAppClass = false;
			
			F2.init();
			
			F2.AppHandlers
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_BEFORE,
				function(appConfig)
				{
					var $root = $(appConfig.root);
					bRootOnPage = ($root.parents("body:first").length > 0);
					bHasTestAppClass = $root.hasClass("test-app");
					bAppHtmlInRoot = ($root.text() == "Testing");
					bDone = true;
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function(appConfig)
				{
					var $root = $(appConfig.root);
					bRootOnPage = ($root.parents("body:first").length > 0);
					bHasTestAppClass = $root.hasClass("test-app");
					bAppHtmlInRoot = ($root.text() == "Testing");
					bDone = true;
				}
			);
			
			F2.registerApps(appConfig(), appManifest());

			waitsFor(
				function()
				{
					return bDone;
				},
				'AppHandlers.On( appRenderAfter ) was never fired',
				3000
			);
			
			runs(function() {				
				expect(bHasTestAppClass).toBe(true);
				expect(bRootOnPage).toBe(true);
				expect(bAppHtmlInRoot).toBe(true);
			});			
		}
	);
	
	
	
	it(
		'respects appRenderBefore setting appConfig.root and appends app html by default.',
		function() {
			var bDone = false;
			var bRootIsH1 = false;
			var bRootOnPage = false;			
			var bAppHtmlInRoot = false;
			
			F2.init();
			
			F2.AppHandlers
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_BEFORE,
				function(appConfig)
				{
					appConfig.root = $("<h1></h1>").get(0);		
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function(appConfig)
				{
					var $root = $(appConfig.root);					
					bRootIsH1 = $root.is("h1");
					bRootOnPage = ($root.parents("body:first").length > 0);					
					bAppHtmlInRoot = ($root.find("div.test-app").length > 0);
					bDone = true;
				}
			);
			
			F2.registerApps(appConfig(), appManifest());

			waitsFor(
				function()
				{
					return bDone;
				},
				'AppHandlers.On( appRenderAfter ) was never fired',
				3000
			);
			
			runs(function() {
				expect(bRootIsH1).toBe(true);
				expect(bRootOnPage).toBe(true);
				expect(bAppHtmlInRoot).toBe(true);
			});			
		}
	);
	
	it(
		'fires appRenderBefore functions sequentially.',
		function() {
			var bDone = false;
			var arOrder = [];
			var bRootIsApp = false;
			var bRootOnPage = false;			
			var bAppHtmlInRoot = false;
			
			F2.init();
			
			F2.AppHandlers
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_BEFORE,
				function(appConfig)
				{
					appConfig.root = $("<app></app>").get(0);
					arOrder.push("1");							
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_BEFORE,
				function(appConfig)
				{
					arOrder.push("2");
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_BEFORE,
				function(appConfig)
				{
					arOrder.push("3");					
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function(appConfig)
				{
					var $root = $(appConfig.root);					
					bRootIsApp = $root.is("app");
					bRootOnPage = ($root.parents("body:first").length > 0);					
					bAppHtmlInRoot = ($root.find("div.test-app").length > 0);
					bDone = true;
				}
			);
			
			F2.registerApps(appConfig(), appManifest());

			waitsFor(
				function()
				{
					return bDone;
				},
				'AppHandlers.On( appRenderAfter ) was never fired',
				3000
			);
			
			runs(function() {
				expect(arOrder.join(",")).toBe("1,2,3");
				expect(bRootIsApp).toBe(true);
				expect(bRootOnPage).toBe(true); 
				expect(bAppHtmlInRoot).toBe(true);
			});			
		}
	);
	
	it(
		'allows manipulation of appConfig.root through out appRenderBefore methods.',
		function() {
			var bDone = false;
			var arOrder = [];
			var bRootIsApp = false;
			var bRootOnPage = false;			
			var bAppHtmlInRoot = false;
			var bHasBlueClass = false;
			var bHasRedClass = false;
			var bHasTestAttr = false;
			
			F2.init();
			
			F2.AppHandlers
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_BEFORE,
				function(appConfig)
				{
					appConfig.root = $("<app></app>").get(0);
					arOrder.push("1");
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_BEFORE,
				function(appConfig)
				{
					$(appConfig.root).addClass("blue");
					arOrder.push("2");
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_BEFORE,
				function(appConfig)
				{
					$(appConfig.root).addClass("red").attr("data-test", "test");
					arOrder.push("3");					
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function(appConfig)
				{
					var $root = $(appConfig.root);					
					bRootIsApp = $root.is("app");
					bRootOnPage = ($root.parents("body:first").length > 0);					
					bAppHtmlInRoot = ($root.find("div.test-app").length > 0);
					bHasBlueClass = $root.hasClass("blue");
					bHasRedClass = $root.hasClass("red");
					bHasTestAttr = !!$root.attr("data-test");
					bDone = true;
				}
			);
			
			F2.registerApps(appConfig(), appManifest());

			waitsFor(
				function()
				{
					return bDone;
				},
				'AppHandlers.On( appRenderAfter ) was never fired',
				3000
			);
			
			runs(function() {
				expect(bHasBlueClass).toBe(true);
				expect(bHasRedClass).toBe(true); 
				expect(bHasTestAttr).toBe(true);
				expect(arOrder.join(",")).toBe("1,2,3");
				expect(bRootIsApp).toBe(true);
				expect(bRootOnPage).toBe(true); 
				expect(bAppHtmlInRoot).toBe(true);
			});			
		}
	);
	
	it(
		'allows resetting of appConfig.root.',
		function() {
			var bDone = false;
			var arOrder = [];
			var bRootIsApp = false;
			var bRootOnPage = false;			
			var bAppHtmlInRoot = false;
			
			F2.init();
			
			F2.AppHandlers
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_BEFORE,
				function(appConfig)
				{
					appConfig.root = $("<app></app>").get(0);
					arOrder.push("1");
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_BEFORE,
				function(appConfig)
				{
					appConfig.root = $("<specialapp></specialapp>").get(0);
					arOrder.push("2");
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function(appConfig)
				{
					var $root = $(appConfig.root);					
					bRootIsApp = $root.is("specialapp");
					bRootOnPage = ($root.parents("body:first").length > 0);					
					bAppHtmlInRoot = ($root.find("div.test-app").length > 0);					
					bDone = true;
				}
			);
			
			F2.registerApps(appConfig(), appManifest());

			waitsFor(
				function()
				{
					return bDone;
				},
				'AppHandlers.On( appRenderAfter ) was never fired',
				3000
			);
			
			runs(function() {				
				expect(arOrder.join(",")).toBe("1,2");
				expect(bRootIsApp).toBe(true);
				expect(bRootOnPage).toBe(true); 
				expect(bAppHtmlInRoot).toBe(true);
			});			
		}
	);
	
});

describe('F2.AppHandlers - rendering - appRender', function() {
	
	var containerAppHandlerToken = null;
	
	var async = new AsyncSpec(this);
	async.beforeEachReloadF2(function() { if(F2.AppHandlers.getToken) { containerAppHandlerToken = F2.AppHandlers.getToken(); } });
	
	var appConfig = function()
	{
		return {
			appId: TEST_APP_ID,
			manifestUrl: TEST_MANIFEST_URL
		};
	};
	
	var appManifest = function()
	{
		return {
			scripts:[],
			styles:[],
			inlineScripts:[],
			apps:[
				{
					html: '<div class="test-app">Testing</div>'
				}
			]
		};
	};
	
	it(
		'should pass appConfig and html as only arguments to appRender.',
		function() {
			var bDone = false;			
			var bHasAppConfig = false;
			var bHasHtml = false;
			
			F2.init();
			
			F2.AppHandlers
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_CREATE_ROOT,
				function(appConfig)
				{
					appConfig.root = $("<div></div>").get(0);					
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER,
				function(appConfig, html)
				{					
					bHasAppConfig = (arguments.length == 2 && appConfig && appConfig.appId && appConfig.manifestUrl) ? true : false;
					bHasHtml = (arguments.length == 2 && html && typeof(html) === "string") ? true : false;
					var $root = $(appConfig.root);
					$root.append(html);
					$("body").append($root);
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function(appConfig)
				{
					bDone = true;
				}
			);
			
			F2.registerApps(appConfig(), appManifest());

			waitsFor(
				function()
				{
					return bDone;
				},
				'AppHandlers.On( appRenderAfter ) was never fired',
				3000
			);
			
			runs(function() {				
				expect(bHasAppConfig).toBe(true);
				expect(bHasHtml).toBe(true);
			});			
		}
	);
	
	it(
		'should automatically create appRoot from app html and add app to the page if no appRender method is bound.',
		function() {
			var bDone = false;
			var bRootOnPage = false;
			var bAppIsRoot = false;
			var bAppHtmlInRoot = false;			
			
			F2.init();
			
			F2.AppHandlers
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function(appConfig)
				{
					var $root = $(appConfig.root);
					bRootOnPage = ($root.parents("body:first").length > 0);
					bAppIsRoot = $root.hasClass("test-app");
					bAppHtmlInRoot = ($root.text() == "Testing");
					bDone = true;
				}
			);
			
			F2.registerApps(appConfig(), appManifest());

			waitsFor(
				function()
				{
					return bDone;
				},
				'AppHandlers.On( appRenderAfter ) was never fired',
				3000
			);
			
			runs(function() {								
				expect(bAppIsRoot).toBe(true);
				expect(bRootOnPage).toBe(true);
				expect(bAppHtmlInRoot).toBe(true);
			});			
		}
	);
	
	it(
		'respects appRender appending html and putting it on the page manually.',
		function() {
			var bDone = false;
			var bRootIsApp = false;
			var bRootOnPage = false;			
			var bRootInParent = false;
			var bAppHtmlInRoot = false;
			
			$("div.app-area").remove();
			$("<div class='app-area'></div>").appendTo("body");
			
			F2.init();
			
			F2.AppHandlers
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_CREATE_ROOT,
				function(appConfig)
				{
					appConfig.root = $("<app></app>").get(0);
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER,
				function(appConfig, html)
				{
					var $root = $(appConfig.root);
					$root.append(html);					
					
					$("body div.app-area:first").append($root);
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function(appConfig)
				{
					var $root = $(appConfig.root);					
					bRootIsApp = $root.is("app");
					bRootOnPage = ($root.parents("body:first").length > 0);					
					bRootInParent = $root.parent().is("div.app-area");
					bAppHtmlInRoot = ($root.find("div.test-app").length > 0);
					bDone = true;					
				}
			);
			
			F2.registerApps(appConfig(), appManifest());

			waitsFor(
				function()
				{
					return bDone;
				},
				'AppHandlers.On( appRenderAfter ) was never fired',
				3000
			);
			
			runs(function() {
				expect(bRootIsApp).toBe(true);
				expect(bRootOnPage).toBe(true);
				expect(bRootInParent).toBe(true);
				expect(bAppHtmlInRoot).toBe(true);				
			});			
		}
	);
	
	it(
		'allows dom node to be only argument to appRender. Which renders the app to the dom node.',
		function() {
			var bDone = false;
			var bRootIsApp = false;
			var bRootOnPage = false;			
			var bRootInParent = false;
			var bAppHtmlInRoot = false;
			
			// append a placeholder for the app
			$("<div class='app-area'></div>").appendTo("body");
			
			F2.init();
			
			F2.AppHandlers
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_CREATE_ROOT,
				function(appConfig)
				{
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
				function(appConfig)
				{
					var $root = $(appConfig.root);					
					bRootIsApp = $root.is("app");
					bRootOnPage = ($root.parents("body:first").length > 0);					
					bRootInParent = $root.parent().is("div.app-area");
					bAppHtmlInRoot = ($root.find("div.test-app").length > 0);
					bDone = true;
					$("div.app-area").remove();
				}
			);
			
			F2.registerApps(appConfig(), appManifest());

			waitsFor(
				function()
				{
					return bDone;
				},
				'AppHandlers.On( appRenderAfter ) was never fired',
				3000
			);
			
			runs(function() {
				expect(bRootIsApp).toBe(true);
				expect(bRootOnPage).toBe(true);
				expect(bRootInParent).toBe(true);
				expect(bAppHtmlInRoot).toBe(true);
			});			
		}
	);

	it(
		'should allow dom node to be only argument to appRender. Which renders the app to the dom node without needing to specifiy appCreateRoot handler.',
		function() {
			var bDone = false;
			var bRootOnPage = false;			
			var bRootInParent = false;
			var bRootIsAppHtml = false;
			
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
				function(appConfig)
				{
					var $root = $(appConfig.root);					
					bRootOnPage = ($root.parents("body:first").length > 0);					
					bRootInParent = $root.parent().is("div.app-area");
					bRootIsAppHtml = $root.hasClass("test-app");
					bDone = true;
					$("div.app-area").remove();
				}
			);
			
			F2.registerApps(appConfig(), appManifest());

			waitsFor(
				function()
				{
					return bDone;
				},
				'AppHandlers.On( appRenderAfter ) was never fired',
				3000
			);
			
			runs(function() {
				expect(bRootOnPage).toBe(true);
				expect(bRootInParent).toBe(true);
				expect(bRootIsAppHtml).toBe(true);
			});			
		}
	);
	
	it(
		'fires appRender functions sequentially.',
		function() {
			var bDone = false;
			var arOrder = [];
			var bRootIsApp = false;
			var bRootOnPage = false;			
			var bRootInParent = false;
			var bAppHtmlInRoot = false;
			
			// append a placeholder for the app
			$("<div class='app-area'></div>").appendTo("body");
			
			F2.init();
			
			F2.AppHandlers
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_CREATE_ROOT,
				function(appConfig)
				{
					appConfig.root = $("<app></app>").get(0);
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER,
				function(appConfig)
				{					
					arOrder.push("1");							
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER,
				function(appConfig)
				{
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
				function(appConfig)
				{
					arOrder.push("3");
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function(appConfig)
				{
					var $root = $(appConfig.root);					
					bRootIsApp = $root.is("app");
					bRootOnPage = ($root.parents("body:first").length > 0);					
					bRootInParent = $root.parent().is("div.app-area");
					bAppHtmlInRoot = ($root.find("div.test-app").length > 0);
					bDone = true;
					$("div.app-area").remove();
				}
			);
			
			F2.registerApps(appConfig(), appManifest());

			waitsFor(
				function()
				{
					return bDone;
				},
				'AppHandlers.On( appRenderAfter ) was never fired',
				3000
			);
			
			runs(function() {
				expect(arOrder.join(",")).toBe("1,2,3");
				expect(bRootIsApp).toBe(true);
				expect(bRootOnPage).toBe(true);
				expect(bRootInParent).toBe(true);
				expect(bAppHtmlInRoot).toBe(true);
			});			
		}
	);
	
	it(
		'allows manipulation of appConfig.root through out appRender methods.',
		function() {
			var bDone = false;
			var arOrder = [];
			var bRootIsApp = false;
			var bRootOnPage = false;			
			var bAppHtmlInRoot = false;
			var bHasBlueClass = false;
			var bHasRedClass = false;
			var bHasTestAttr = false;
			var bRootInParent = false;
			
			$("<div class='app-area'></div>").appendTo("body");
			
			F2.init();
			
			F2.AppHandlers
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_CREATE_ROOT,
				function(appConfig)
				{
					appConfig.root = $("<app></app>").get(0);					
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER,
				function(appConfig)
				{					
					arOrder.push("1");
				}
			)	
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER,
				function(appConfig)
				{
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
				function(appConfig)
				{
					$(appConfig.root).addClass("red").attr("data-test", "test");
					arOrder.push("3");					
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function(appConfig)
				{
					var $root = $(appConfig.root);					
					bRootIsApp = $root.is("app");
					bRootOnPage = ($root.parents("body:first").length > 0);					
					bAppHtmlInRoot = ($root.find("div.test-app").length > 0);
					bHasBlueClass = $root.hasClass("blue");
					bRootInParent = $root.parent().is("div.app-area");
					bHasRedClass = $root.hasClass("red");
					bHasTestAttr = !!$root.attr("data-test");
					bDone = true;
				}
			);
			
			F2.registerApps(appConfig(), appManifest());

			waitsFor(
				function()
				{
					return bDone;
				},
				'AppHandlers.On( appRenderAfter ) was never fired',
				3000
			);
			
			runs(function() {
				expect(bHasBlueClass).toBe(true);
				expect(bHasRedClass).toBe(true); 
				expect(bHasTestAttr).toBe(true);
				expect(arOrder.join(",")).toBe("1,2,3");
				expect(bRootIsApp).toBe(true);
				expect(bRootOnPage).toBe(true); 
				expect(bAppHtmlInRoot).toBe(true);				
				expect(bRootInParent).toBe(true);
			});			
		}
	);	
	
});

describe('F2.AppHandlers - rendering - appRenderAfter', function() {
	
	var containerAppHandlerToken = null;
	
	var async = new AsyncSpec(this);
	async.beforeEachReloadF2(function() { if(F2.AppHandlers.getToken) { containerAppHandlerToken = F2.AppHandlers.getToken(); } });
	
	var appConfig = function()
	{
		return {
			appId: TEST_APP_ID,
			manifestUrl: TEST_MANIFEST_URL
		};
	};
	
	var appManifest = function()
	{
		return {
			scripts:[],
			styles:[],
			inlineScripts:[],
			apps:[
				{
					html: '<div class="test-app">Testing</div>'
				}
			]
		};
	};
	
	it(
		'should pass appConfig as only argument to appRenderAfter.',
		function() {
			var bDone = false;			
			var bHasAppConfig = false;			
			
			F2.init();
			
			F2.AppHandlers
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function(appConfig)
				{
					bHasAppConfig = (arguments.length == 1 && appConfig && appConfig.appId && appConfig.manifestUrl) ? true : false;
					bDone = true;
				}
			);
			
			F2.registerApps(appConfig(), appManifest());

			waitsFor(
				function()
				{
					return bDone;
				},
				'AppHandlers.On( appRenderAfter ) was never fired',
				3000
			);
			
			runs(function() {				
				expect(bHasAppConfig).toBe(true);
			});			
		}
	);
	
	it(
		'should fire appRenderAfter only after app is in dom.',
		function() {
			var bDone = false;
			var bRootOnPage = false;
			var bAppIsRoot = false;
			var bAppHtmlInRoot = false;			
			
			F2.init();
			
			F2.AppHandlers
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function(appConfig)
				{
					var $root = $(appConfig.root);
					bRootOnPage = ($root.parents("body:first").length > 0);
					bAppIsRoot = $root.hasClass("test-app");
					bAppHtmlInRoot = ($root.text() == "Testing");
					bDone = true;
				}
			);
			
			F2.registerApps(appConfig(), appManifest());

			waitsFor(
				function()
				{
					return bDone;
				},
				'AppHandlers.On( appRenderAfter ) was never fired',
				3000
			);
			
			runs(function() {								
				expect(bAppIsRoot).toBe(true);
				expect(bRootOnPage).toBe(true);
				expect(bAppHtmlInRoot).toBe(true);
			});			
		}
	);
	
	it(
		'fires appRenderAfter functions sequentially.',
		function() {
			var bDone = false;
			var arOrder = [];			
			var bRootOnPage = false;			
			var bAppHtmlInRoot = false;
			
			F2.init();
			
			F2.AppHandlers			
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function(appConfig)
				{					
					arOrder.push("1");							
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function(appConfig)
				{
					arOrder.push("2");
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function(appConfig)
				{
					arOrder.push("3");
					var $root = $(appConfig.root);										
					bRootOnPage = ($root.parents("body:first").length > 0);					
					bAppHtmlInRoot = ($root.text() == "Testing");
					bDone = true;					
				}
			);
			
			F2.registerApps(appConfig(), appManifest());

			waitsFor(
				function()
				{
					return bDone;
				},
				'AppHandlers.On( appRenderAfter ) was never fired',
				3000
			);
			
			runs(function() {
				expect(arOrder.join(",")).toBe("1,2,3");				
				expect(bRootOnPage).toBe(true);				
				expect(bAppHtmlInRoot).toBe(true);
			});			
		}
	);	
	
});

describe('F2.AppHandlers - rendering - appDestroyBefore', function() {
	var containerAppHandlerToken = null;
	
	var async = new AsyncSpec(this);
	async.beforeEachReloadF2(function() { if(F2.AppHandlers.getToken) { containerAppHandlerToken = F2.AppHandlers.getToken(); } });
	
	var appConfig = function()
	{
		return {
			appId: TEST_APP_ID,
			manifestUrl: TEST_MANIFEST_URL
		};
	};
	
	var appManifest = function()
	{
		return {
			scripts:[],
			styles:[],
			inlineScripts:[],
			apps:[
				{
					html: '<div class="test-app">Testing</div>'
				}
			]
		};
	};

	it(
		'should remove on() appDestroyBefore handlers regardless of namespace if no namespace passed to off() event.',
		function() {
			var bAppStillAround = false;			
			var bAppGone = false;			
			var $root = null;
			var bAppDestroyOnMethodCalled = false;
			var bAppDestroyWithNamespaceOnMethodCalled = false;

			F2.init();
			
			F2.AppHandlers
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_DESTROY_BEFORE,
				function()
				{
					bAppDestroyOnMethodCalled = true;				
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_DESTROY_BEFORE + ".specialNamespace",
				function()
				{
					bAppDestroyWithNamespaceOnMethodCalled = true;				
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function(appConfig)
				{
					$root = $(appConfig.root);
					setTimeout(function() { bAppGone = true; }, 700);
					F2.AppHandlers.off(containerAppHandlerToken, F2.Constants.AppHandlers.APP_DESTROY_BEFORE);
					F2.removeApp(appConfig.instanceId);					
				}
			);
			
			F2.registerApps(appConfig(), appManifest());

			waitsFor(
				function()
				{
					return bAppGone;
				},
				'AppHandlers.On( appRenderAfter ) was never fired',
				3000
			);
			
			runs(function() {
				expect($root.parent().length == 0).toBe(true);
				expect(bAppDestroyOnMethodCalled).toBe(false);
				expect(bAppDestroyWithNamespaceOnMethodCalled).toBe(false);
			});
		}
	);

	it(
		'should only remove on() from appDestroyBefore handlers if namespace matches what was passed to off() event.',
		function() {
			var bAppStillAround = false;			
			var bAppGone = false;			
			var $root = null;
			var bAppDestroyOnMethodCalled = false;
			var bAppDestroyWithNamespaceOnMethodCalled = false;

			F2.init();
			
			F2.AppHandlers
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_DESTROY_BEFORE,
				function()
				{
					bAppDestroyOnMethodCalled = true;
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_DESTROY_BEFORE + ".specialNamespace",
				function()
				{
					bAppDestroyWithNamespaceOnMethodCalled = true;				
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function(appConfig)
				{
					$root = $(appConfig.root);
					setTimeout(function() { bAppGone = true; }, 700);
					F2.AppHandlers.off(containerAppHandlerToken, F2.Constants.AppHandlers.APP_DESTROY_BEFORE + ".specialNamespace");
					F2.removeApp(appConfig.instanceId);					
				}
			);
			
			F2.registerApps(appConfig(), appManifest());

			waitsFor(
				function()
				{
					return bAppGone;
				},
				'AppHandlers.On( appRenderAfter ) was never fired',
				3000
			);
			
			runs(function() {				
				expect($root.parent().length == 0).toBe(true);
				expect(bAppDestroyOnMethodCalled).toBe(true);
				expect(bAppDestroyWithNamespaceOnMethodCalled).toBe(false);
			});
		}
	);
});

describe('F2.AppHandlers - rendering - appDestroy', function() {
	
	var containerAppHandlerToken = null;
	
	var async = new AsyncSpec(this);
	async.beforeEachReloadF2(function() { if(F2.AppHandlers.getToken) { containerAppHandlerToken = F2.AppHandlers.getToken(); } });
	
	var appConfig = function()
	{
		return {
			appId: TEST_APP_ID,
			manifestUrl: TEST_MANIFEST_URL
		};
	};
	
	var appManifest = function()
	{
		return {
			scripts:[],
			styles:[],
			inlineScripts:[],
			apps:[
				{
					html: '<div class="test-app">Testing</div>'
				}
			]
		};
	};
	
	it(
		'should remove app from page if no appHandlers are declared.',
		function() {
			var bAppStillAround = false;			
			var bAppGone = false;			
			var $root = null;
			
			F2.init();
			
			F2.AppHandlers
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function(appConfig)
				{
					$root = $(appConfig.root);
					setTimeout(function() { bAppStillAround = true; }, 100);
					setTimeout(function() { bAppGone = true; }, 600);
					F2.removeApp(appConfig.instanceId);					
				}
			);
			
			F2.registerApps(appConfig(), appManifest());

			waitsFor(
				function()
				{
					return bAppStillAround;
				},
				'AppHandlers.On( appRenderAfter ) was never fired',
				3000
			);
			
			runs(function() {				
				expect($root.parent().length == 1).toBe(true);
			});

			waitsFor(
				function()
				{
					return bAppGone;
				},
				'AppHandlers.On( appRenderAfter ) was never fired',
				3000
			);
			
			runs(function() {				
				expect($root.parent().length == 0).toBe(true);
			});
		}
	);

	it('should call app instance .destroy() method if destory method exists.', function(){
		F2.inlineScriptsEvaluated = false;
		F2.init();
		F2.registerApps([{appId:'com_openf2_tests_helloworld', manifestUrl:'/'}], [{"inlineScripts": [], "scripts":["js/test.js"],"apps":[{ html: '<div class="test-app-2">Testing</div>' }]}]);
		
		waitsFor(
			function()
			{
				return F2.testAppInitialized;
			},
			'Inline scripts were never evaluated',
			3000
		);
		
		runs(function() {
			F2.removeApp(F2.testAppInstanceID);
			
			waitsFor(
				function()
				{
					return F2.destroyAppMethodCalled;
				},
				'destroy() method was never evaluated',
				3000
			);

			runs(function() {
				expect(F2.destroyAppMethodCalled).toBe(true);
			});
		});
	});

	it(
		'should remove on() appDestroy handlers regardless of namespace if no namespace passed to off() event.',
		function() {
			var bAppStillAround = false;			
			var bAppGone = false;			
			var $root = null;
			var bAppDestroyOnMethodCalled = false;
			var bAppDestroyWithNamespaceOnMethodCalled = false;

			F2.init();
			
			F2.AppHandlers
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_DESTROY,
				function(appConfig)
				{
					bAppDestroyOnMethodCalled = true;				
				}
			)
			.on(
				containerAppHandlerToken,
				"appDestroy.specialNamespace",
				function(appConfig)
				{
					bAppDestroyWithNamespaceOnMethodCalled = true;				
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function(appConfig)
				{
					$root = $(appConfig.root);
					setTimeout(function() { bAppGone = true; }, 600);
					F2.AppHandlers.off(containerAppHandlerToken, F2.Constants.AppHandlers.APP_DESTROY);
					F2.removeApp(appConfig.instanceId);					
				}
			);
			
			F2.registerApps(appConfig(), appManifest());

			waitsFor(
				function()
				{
					return bAppGone;
				},
				'AppHandlers.On( appRenderAfter ) was never fired',
				3000
			);
			
			runs(function() {				
				expect($root.parent().length == 0).toBe(true);
				expect(bAppDestroyOnMethodCalled).toBe(false);
				expect(bAppDestroyWithNamespaceOnMethodCalled).toBe(false);
			});
		}
	);

	it(
		'should only remove on() from appDestroy handlers if namespace matches what was passed to off() event.',
		function() {
			var bAppStillAround = false;			
			var bAppGone = false;			
			var $root = null;
			var bAppDestroyOnMethodCalled = false;
			var bAppDestroyWithNamespaceOnMethodCalled = false;

			F2.init();
			
			F2.AppHandlers
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_DESTROY,
				function(appInstance)
				{
					// call the apps destroy method, if it has one
					if(appInstance && appInstance.app && appInstance.app.destroy && typeof(appInstance.app.destroy) == "function")
					{
						appInstance.app.destroy();
					}
					// warn the container developer/app developer that even though they have a destroy method it hasn't been 
					else if(appInstance && appInstance.app && appInstance.app.destroy)
					{
						F2.log(app.config.appId + " has a destroy property, but destroy is not of type function and as such will not be executed.");
					}
					
					// fade out and remove the root
					jQuery(appInstance.config.root).fadeOut(250, function() {
						jQuery(this).remove();
					});
		
					bAppDestroyOnMethodCalled = true;
				}
			)
			.on(
				containerAppHandlerToken,
				"appDestroy.specialNamespace",
				function(appConfig)
				{
					bAppDestroyWithNamespaceOnMethodCalled = true;				
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function(appConfig)
				{
					$root = $(appConfig.root);
					setTimeout(function() { bAppGone = true; }, 400);
					F2.AppHandlers.off(containerAppHandlerToken, "appDestroy.specialNamespace");
					F2.removeApp(appConfig.instanceId);					
				}
			);
			
			F2.registerApps(appConfig(), appManifest());

			waitsFor(
				function()
				{
					return bAppGone;
				},
				'AppHandlers.On( appRenderAfter ) was never fired',
				3000
			);
			
			runs(function() {				
				expect($root.parent().length == 0).toBe(true);
				expect(bAppDestroyOnMethodCalled).toBe(true);
				expect(bAppDestroyWithNamespaceOnMethodCalled).toBe(false);
			});
		}
	);
});

describe('F2.AppHandlers - rendering - appDestroyBefore', function() {
	var containerAppHandlerToken = null;
	
	var async = new AsyncSpec(this);
	async.beforeEachReloadF2(function() { if(F2.AppHandlers.getToken) { containerAppHandlerToken = F2.AppHandlers.getToken(); } });
	
	var appConfig = function()
	{
		return {
			appId: TEST_APP_ID,
			manifestUrl: TEST_MANIFEST_URL
		};
	};
	
	var appManifest = function()
	{
		return {
			scripts:[],
			styles:[],
			inlineScripts:[],
			apps:[
				{
					html: '<div class="test-app">Testing</div>'
				}
			]
		};
	};

	it(
		'should remove on() appDestroyAfter handlers regardless of namespace if no namespace passed to off() event.',
		function() {
			var bAppStillAround = false;			
			var bAppGone = false;			
			var $root = null;
			var bAppDestroyOnMethodCalled = false;
			var bAppDestroyWithNamespaceOnMethodCalled = false;

			F2.init();
			
			F2.AppHandlers
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_DESTROY_AFTER,
				function()
				{
					bAppDestroyOnMethodCalled = true;				
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_DESTROY_AFTER + ".specialNamespace",
				function()
				{
					bAppDestroyWithNamespaceOnMethodCalled = true;				
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function(appConfig)
				{
					$root = $(appConfig.root);
					setTimeout(function() { bAppGone = true; }, 700);
					F2.AppHandlers.off(containerAppHandlerToken, F2.Constants.AppHandlers.APP_DESTROY_AFTER);
					F2.removeApp(appConfig.instanceId);					
				}
			);
			
			F2.registerApps(appConfig(), appManifest());

			waitsFor(
				function()
				{
					return bAppGone;
				},
				'AppHandlers.On( appRenderAfter ) was never fired',
				3000
			);
			
			runs(function() {
				expect($root.parent().length == 0).toBe(true);
				expect(bAppDestroyOnMethodCalled).toBe(false);
				expect(bAppDestroyWithNamespaceOnMethodCalled).toBe(false);
			});
		}
	);

	it(
		'should only remove on() from appDestroyAfter handlers if namespace matches what was passed to off() event.',
		function() {
			var bAppStillAround = false;			
			var bAppGone = false;			
			var $root = null;
			var bAppDestroyOnMethodCalled = false;
			var bAppDestroyWithNamespaceOnMethodCalled = false;

			F2.init();
			
			F2.AppHandlers
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_DESTROY_AFTER,
				function()
				{
					bAppDestroyOnMethodCalled = true;
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_DESTROY_AFTER + ".specialNamespace",
				function()
				{
					bAppDestroyWithNamespaceOnMethodCalled = true;				
				}
			)
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function(appConfig)
				{
					$root = $(appConfig.root);
					setTimeout(function() { bAppGone = true; }, 700);
					F2.AppHandlers.off(containerAppHandlerToken, F2.Constants.AppHandlers.APP_DESTROY_AFTER + ".specialNamespace");
					F2.removeApp(appConfig.instanceId);					
				}
			);
			
			F2.registerApps(appConfig(), appManifest());

			waitsFor(
				function()
				{
					return bAppGone;
				},
				'AppHandlers.On( appRenderAfter ) was never fired',
				3000
			);
			
			runs(function() {				
				expect($root.parent().length == 0).toBe(true);
				expect(bAppDestroyOnMethodCalled).toBe(true);
				expect(bAppDestroyWithNamespaceOnMethodCalled).toBe(false);
			});
		}
	);

});

describe('F2.AppHandlers - error handling - appScriptLoadFailed',function() {

	var containerAppHandlerToken = null;
	
	var async = new AsyncSpec(this);
	async.beforeEachReloadF2(function() { if(F2.AppHandlers.getToken) { containerAppHandlerToken = F2.AppHandlers.getToken(); } });
	
	var appConfig = function()
	{
		return {
			appId: TEST_APP_ID,
			manifestUrl: TEST_MANIFEST_URL
		};
	};
	
	var appManifest = function()
	{
		return {
			scripts:['http://docs.openf2.org/demos/apps/JavaScript/HelloWorld/doesNotExist.js'],
			styles:[],
			inlineScripts:[],
			apps:[
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
		function() {
			var bScriptLoadFailedReceived = false;

			// Reduce timeout so this unit test doesn't take 7 seconds
			F2.init({scriptErrorTimeout: 100});

			F2.AppHandlers
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_SCRIPT_LOAD_FAILED,
				function(appConfig, scriptInfo)
				{
					bScriptLoadFailedReceived = true;
					F2.AppHandlers.off(containerAppHandlerToken, F2.Constants.AppHandlers.APP_SCRIPT_LOAD_FAILED);
					F2.removeApp(appConfig.instanceId);
				}
			);

			F2.registerApps(appConfig(), appManifest());

			waitsFor(
				function()
				{
					return bScriptLoadFailedReceived;
				},
				'AppHandlers.On( appScriptLoadFailed ) was never fired',
				3000
			);

			runs(function() {
				expect(bScriptLoadFailedReceived).toBe(true);
			});
		}
	);

	it(
		'handler should receive appScriptLoadFailed event due to invalid inline script',
		function() {
			var bScriptLoadFailedReceived = false;

			F2.init();

			F2.AppHandlers
			.on(
				containerAppHandlerToken,
				F2.Constants.AppHandlers.APP_SCRIPT_LOAD_FAILED,
				function(appConfig, scriptInfo)
				{
					bScriptLoadFailedReceived = true;
					F2.AppHandlers.off(containerAppHandlerToken, F2.Constants.AppHandlers.APP_SCRIPT_LOAD_FAILED);
					F2.removeApp(appConfig.instanceId);
				}
			);

			F2.registerApps(appConfig(), invalidInlineAppManifest);

			waitsFor(
				function()
				{
					return bScriptLoadFailedReceived;
				},
				'AppHandlers.On( appScriptLoadFailed ) was never fired',
				3000 
			);

			runs(function() {
				expect(bScriptLoadFailedReceived).toBe(true);
			});
		}
	);
});