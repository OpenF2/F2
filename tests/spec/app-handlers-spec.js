describe('F2.AppHandlers', function() {

	var containerToken;

	var async = new AsyncSpec(this);
	async.beforeEachReloadF2(function() {
		if (F2.AppHandlers.getToken) {
			containerToken = F2.AppHandlers.getToken();
		}

		// Set a low timeout for testing
		F2.ContainerConfig.scriptErrorTimeout = 100;
	});

	function appConfig() {
		return {
			appId: TEST_APP_ID,
			manifestUrl: TEST_MANIFEST_URL
		};
	};

	function appManifest() {
		return {
			apps: [{
				html: '<div class="test-app">Testing</div>'
			}],
			inlineScripts: [],
			scripts: [],
			styles: []
		}
	};

	it('should not be required to load apps', function() {
		expect(function() {
			F2.init();
			F2.registerApps(appConfig(), appManifest());
		}).not.toThrow();
	});

	it('should use AppHandlers if container config handlers are defined', function() {
		var afterFired = false;
		var beforeFired = false;
		var renderFired = false;

		F2.AppHandlers.on(
			containerToken,
			F2.Constants.AppHandlers.APP_RENDER_BEFORE,
			function(appConfig) {
				throw new Error("I should not fire!");
			}
		);
		F2.AppHandlers.on(
			containerToken,
			F2.Constants.AppHandlers.APP_RENDER,
			function(appConfig) {
				throw new Error("I should not fire!");
			}
		);
		F2.AppHandlers.on(
			containerToken,
			F2.Constants.AppHandlers.APP_RENDER_AFTER,
			function(appConfig) {
				throw new Error("I should not fire!");
			}
		);

		F2.init({
			afterAppRender: function() {
				afterFired = true;
			},
			appRender: function() {
				renderFired = true;
			},
			beforeAppRender: function() {
				beforeFired = true;
			}
		});
		F2.registerApps(appConfig(), appManifest());

		waitsFor(function() {
			return afterFired;
		}, 1000);

		runs(function() {
			expect(afterFired).toBe(true);
			expect(beforeFired).toBe(true);
			expect(renderFired).toBe(true);
		});
	});

	it('should fire if container config handlers are not defined', function() {
		var afterFired = false;
		var beforeFired = false;
		var renderFired = false;

		F2.AppHandlers.on(
			containerToken,
			F2.Constants.AppHandlers.APP_RENDER_BEFORE,
			function(appConfig) {
				beforeFired = true;
			}
		);
		F2.AppHandlers.on(
			containerToken,
			F2.Constants.AppHandlers.APP_RENDER,
			function(appConfig) {
				appConfig.root = document.body;
				renderFired = true;
			}
		);
		F2.AppHandlers.on(
			containerToken,
			F2.Constants.AppHandlers.APP_RENDER_AFTER,
			function(appConfig) {
				afterFired = true;
			}
		);

		F2.init();
		F2.registerApps(appConfig(), appManifest());

		waitsFor(function() {
			return afterFired;
		}, 1000);

		runs(function() {
			expect(afterFired).toBe(true);
			expect(beforeFired).toBe(true);
			expect(renderFired).toBe(true);
		});
	});

	it('should fire in order', function() {
		var afterFired = false;
		var order = [];

		F2.AppHandlers.on(
			containerToken,
			F2.Constants.AppHandlers.APP_CREATE_ROOT,
			function(appConfig) {
				appConfig.root = document.body;
				order.push(F2.Constants.AppHandlers.APP_CREATE_ROOT);
			}
		);
		F2.AppHandlers.on(
			containerToken,
			F2.Constants.AppHandlers.APP_RENDER_BEFORE,
			function(appConfig) {
				order.push(F2.Constants.AppHandlers.APP_RENDER_BEFORE);
			}
		);
		F2.AppHandlers.on(
			containerToken,
			F2.Constants.AppHandlers.APP_RENDER,
			function(appConfig) {
				order.push(F2.Constants.AppHandlers.APP_RENDER);
			}
		);
		F2.AppHandlers.on(
			containerToken,
			F2.Constants.AppHandlers.APP_RENDER_AFTER,
			function(appConfig) {
				order.push(F2.Constants.AppHandlers.APP_RENDER_AFTER);
			}
		);
		F2.AppHandlers.on(
			containerToken,
			F2.Constants.AppHandlers.APP_DESTROY_BEFORE,
			function(appConfig) {
				order.push(F2.Constants.AppHandlers.APP_DESTROY_BEFORE);
			}
		);
		F2.AppHandlers.on(
			containerToken,
			F2.Constants.AppHandlers.APP_DESTROY,
			function(appConfig) {
				order.push(F2.Constants.AppHandlers.APP_DESTROY);
			}
		);
		F2.AppHandlers.on(
			containerToken,
			F2.Constants.AppHandlers.APP_DESTROY_AFTER,
			function(appConfig) {
				order.push(F2.Constants.AppHandlers.APP_DESTROY_AFTER);
				afterFired = true;
			}
		);

		F2.init();
		F2.registerApps(appConfig(), appManifest());

		setTimeout(function() {
			F2.removeAllApps();
		}, 0);

		waitsFor(function() {
			return afterFired;
		}, 1000);

		runs(function() {
			expect(order).toEqual([
				F2.Constants.AppHandlers.APP_CREATE_ROOT,
				F2.Constants.AppHandlers.APP_RENDER_BEFORE,
				F2.Constants.AppHandlers.APP_RENDER,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				F2.Constants.AppHandlers.APP_DESTROY_BEFORE,
				F2.Constants.AppHandlers.APP_DESTROY,
				F2.Constants.AppHandlers.APP_DESTROY_AFTER
			]);
		});
	});

	it('should allow multiple callbacks per handler and fire them in FIFO order', function() {
		var done = false;
		var order = [];

		F2.AppHandlers.on(
			containerToken,
			F2.Constants.AppHandlers.APP_RENDER_BEFORE,
			function(appConfig) {
				order.push(1);
			}
		);
		F2.AppHandlers.on(
			containerToken,
			F2.Constants.AppHandlers.APP_RENDER_BEFORE,
			function(appConfig) {
				order.push(2);
			}
		);
		F2.AppHandlers.on(
			containerToken,
			F2.Constants.AppHandlers.APP_RENDER_AFTER,
			function(appConfig) {
				done = true;
			}
		);

		F2.init();
		F2.registerApps(appConfig(), appManifest());

		waitsFor(function() {
			return done;
		}, 1000);

		runs(function() {
			expect(order).toEqual([1, 2]);
		});
	});

	it('should automatically render app root using the apps html', function() {
		var done = false;
		var rootOnPage = false;
		var appHtmlInRoot = false;
		var hasTestAppClass = false;

		F2.AppHandlers.on(
			containerToken,
			F2.Constants.AppHandlers.APP_RENDER_AFTER,
			function(appConfig) {
				var $root = $(appConfig.root);
				rootOnPage = $root.parents('body:first').length > 0;
				hasTestAppClass = $root.hasClass('test-app');
				appHtmlInRoot = $root.text() === 'Testing';
				done = true;
			}
		);

		F2.init();
		F2.registerApps(appConfig(), appManifest());

		waitsFor(function() {
			return done;
		}, 1000);

		runs(function() {
			expect(hasTestAppClass).toBe(true);
			expect(rootOnPage).toBe(true);
			expect(appHtmlInRoot).toBe(true);
		});
	});

	it('should only append app html if root exists', function() {
		var done = false;
		var nodeIsCorrect = false;
		var htmlWasAppended = false;

		F2.AppHandlers.on(
			containerToken,
			F2.Constants.AppHandlers.APP_RENDER_BEFORE,
			function(appConfig) {
				appConfig.root = $('<app />').get(0);
			}
		);
		F2.AppHandlers.on(
			containerToken,
			F2.Constants.AppHandlers.APP_RENDER_AFTER,
			function(appConfig) {
				var $root = $(appConfig.root);
				nodeIsCorrect = $root.is('app');
				htmlWasAppended = $root.text() === 'Testing';
				done = true;
			}
		);

		F2.init();
		F2.registerApps(appConfig(), appManifest());

		waitsFor(function() {
			return done;
		}, 1000);

		runs(function() {
			expect(nodeIsCorrect).toBe(true);
			expect(htmlWasAppended).toBe(true);
		});
	});

	describe('on', function() {

		it('should throw without valid token', function() {
			expect(function() {
				F2.AppHandlers.on(
					'',
					F2.Constants.AppHandlers.APP_RENDER_BEFORE,
					function(appConfig) {}
				);
			}).toThrow();
		});

		it('should throw without a recognized handler name', function() {
			expect(function() {
				F2.AppHandlers.on(
					containerToken,
					'asdf',
					function(appConfig) {}
				);
			}).toThrow();
		});

		it('should allow a handler name to have a trailing namespace', function() {
			expect(function() {
				F2.AppHandlers.on(
					containerToken,
					F2.Constants.AppHandlers.APP_RENDER_BEFORE + '.testing',
					function(appConfig) {}
				);
			}).not.toThrow();
		});
	
	});

	describe('off', function() {

		it('should throw without valid token', function() {
			expect(function() {
				F2.AppHandlers.off(
					'',
					F2.Constants.AppHandlers.APP_RENDER_BEFORE
				);
			}).toThrow();
		});

		it('should throw without a recognized handler name', function() {
			expect(function() {
				F2.AppHandlers.off(
					containerToken,
					'asdf',
					function(appConfig) {}
				);
			}).toThrow();
		});

		it('should remove all type handlers if no namespace is specified', function() {
			var root;
			var handler1Called = false;
			var handler2Called = false;

			F2.AppHandlers.on(
				containerToken,
				F2.Constants.AppHandlers.APP_DESTROY_BEFORE,
				function() {
					handler1Called = true;
				}
			);
			F2.AppHandlers.on(
				containerToken,
				F2.Constants.AppHandlers.APP_DESTROY_BEFORE + ".specialNamespace",
				function() {
					handler2Called = true;
				}
			);
			F2.AppHandlers.on(
				containerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function(appConfig) {
					root = appConfig.root;
					F2.AppHandlers.off(containerToken, F2.Constants.AppHandlers.APP_DESTROY_BEFORE);
					F2.removeApp(appConfig.instanceId);
				}
			);

			F2.init();
			F2.registerApps(appConfig(), appManifest());

			waitsFor( function() {
				return $(root).parents('body:first').length === 0;
			}, 1000);

			runs(function() {
				expect(handler1Called).toBe(false);
				expect(handler2Called).toBe(false);
			});
		});

		it('should remove only type handlers of a given namespace if specified', function() {
			var root;
			var handler1Called = false;
			var handler2Called = false;

			F2.AppHandlers.on(
				containerToken,
				F2.Constants.AppHandlers.APP_DESTROY_BEFORE,
				function() {
					handler1Called = true;
				}
			);
			F2.AppHandlers.on(
				containerToken,
				F2.Constants.AppHandlers.APP_DESTROY_BEFORE + '.specialNamespace',
				function() {
					handler2Called = true;
				}
			);
			F2.AppHandlers.on(
				containerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function(appConfig) {
					root = appConfig.root;
					F2.AppHandlers.off(containerToken, F2.Constants.AppHandlers.APP_DESTROY_BEFORE + '.specialNamespace');
					F2.removeApp(appConfig.instanceId);
				}
			);

			F2.init();
			F2.registerApps(appConfig(), appManifest());

			waitsFor(function() {
				// Wait for app to be removed
				return $(root).parents('body:first').length === 0;
			}, 1000);

			runs(function() {
				expect(handler1Called).toBe(true);
				expect(handler2Called).toBe(false);
			});
		});

	});

	describe('getToken', function() {

		it('should be destroyed after first call', function() {
			// F2.AppHandlers.getToken is called above in the async.beforeEachReloadF2
			expect(F2.AppHandlers.getToken).toBeFalsy();
		});

	});

	describe('__f2GetToken', function() {

		it('should be destroyed after first call', function() {
			// F2.AppHandlers.__f2GetToken is called internally and should no longer exist
			expect(F2.AppHandlers.__f2GetToken).toBeFalsy();
		});

	});

	describe('__trigger', function() {

		it('should not accept container token', function() {
			expect(function() {
				F2.AppHandlers.__trigger(containerToken, F2.Constants.AppHandlers.APP_RENDER_BEFORE);
			}).toThrow();
		});

	});

	describe('APP_CREATE_ROOT', function() {

		it('should pass appConfig to callback', function() {
			var done = false;
			var passedConfig = false;
			var config = appConfig();

			F2.AppHandlers.on(
				containerToken,
				F2.Constants.AppHandlers.APP_CREATE_ROOT,
				function(appConfig) {
					passedConfig = appConfig;
					done = true;
				}
			);

			F2.init();
			F2.registerApps(config, appManifest());

			waitsFor(function() {
				return done;
			}, 1000);

			runs(function() {
				expect(passedConfig.appId).toEqual(config.appId);
				expect(passedConfig.manifestUrl).toEqual(config.manifestUrl);
			});
		});

		it('should allow appConfig root to be redefined between callbacks', function() {
			var done = false;
			var rootIsCorrect = false;
			var htmlWasAppended = false;

			F2.AppHandlers.on(
				containerToken,
				F2.Constants.AppHandlers.APP_CREATE_ROOT,
				function(appConfig) {
					appConfig.root = $('<div></div>').get(0);
				}
			);
			F2.AppHandlers.on(
				containerToken,
				F2.Constants.AppHandlers.APP_CREATE_ROOT,
				function(appConfig) {
					appConfig.root = $('<app />').get(0);
				}
			);
			F2.AppHandlers.on(
				containerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function(appConfig) {
					var $root = $(appConfig.root);
					rootIsCorrect = $root.is('app');
					htmlWasAppended = $root.text() === 'Testing';
					done = true;
				}
			);

			F2.init();
			F2.registerApps(appConfig(), appManifest());

			waitsFor( function() {
				return done;
			}, 1000);

			runs(function() {
				expect(rootIsCorrect).toBe(true);
				expect(htmlWasAppended).toBe(true);
			});
		});

	});

	describe('APP_RENDER_BEFORE', function() {

		it('should pass appConfig to callback', function() {
			var done = false;
			var passedConfig = false;
			var config = appConfig();

			F2.AppHandlers.on(
				containerToken,
				F2.Constants.AppHandlers.APP_RENDER_BEFORE,
				function(appConfig) {
					passedConfig = appConfig;
					done = true;
				}
			);

			F2.init();
			F2.registerApps(config, appManifest());

			waitsFor(function() {
				return done;
			}, 1000);

			runs(function() {
				expect(passedConfig.appId).toEqual(config.appId);
				expect(passedConfig.manifestUrl).toEqual(config.manifestUrl);
			});
		});
	
	});

	describe('APP_RENDER', function() {

		var $testContainer = $('<div id="test-container" />');

		beforeEach(function() {
			$(document.body).append($testContainer);
		});

		afterEach(function() {
			$testContainer.remove();
		});

		it('should pass appConfig and app html to callback', function() {
			var done = false;
			var passedConfig;
			var passedHtml;

			F2.AppHandlers.on(
				containerToken,
				F2.Constants.AppHandlers.APP_RENDER,
				function(appConfig, appHtml) {
					appConfig.root = document.body;

					passedConfig = appConfig;
					passedHtml = appHtml;
					done = true;
				}
			);

			var config = appConfig();
			var manifest = appManifest();
			F2.init();
			F2.registerApps(config, manifest);

			waitsFor(function() {
				return done;
			}, 1000);

			runs(function() {
				expect(passedConfig.appId).toEqual(config.appId);
				expect(passedConfig.manifestUrl).toEqual(config.manifestUrl);
				expect(passedHtml.indexOf('Testing') !== -1).toBe(true);
			});
		});

		it('should not automatically append root to DOM if added manually in callback', function() {
			var done = false;
			var rootParentId = false;

			F2.AppHandlers.on(
				containerToken,
				F2.Constants.AppHandlers.APP_RENDER,
				function(appConfig) {
					appConfig.root = $('<app />').get(0);
					$testContainer.append(appConfig.root);
				}
			);
			F2.AppHandlers.on(
				containerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function(appConfig) {
					rootParentId = $(appConfig.root).parent().attr('id');
					done = true;
				}
			);

			F2.init();
			F2.registerApps(appConfig(), appManifest());

			waitsFor(function() {
				return done;
			}, 1000);

			runs(function() {
				expect(rootParentId).toEqual($testContainer.attr('id'));
			});
		});

		it('should allow root container to be specified instead of callback', function() {
			var done = false;
			var rootParentId;

			F2.AppHandlers.on(
				containerToken,
				F2.Constants.AppHandlers.APP_CREATE_ROOT,
				function(appConfig) {
					appConfig.root = $('<app></app>').get(0);
				}
			);
			F2.AppHandlers.on(
				containerToken,
				F2.Constants.AppHandlers.APP_RENDER,
				$testContainer.get(0)
			);
			F2.AppHandlers.on(
				containerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function(appConfig) {
					rootParentId = $(appConfig.root).parent().attr('id');
					done = true;
				}
			);

			F2.init();
			F2.registerApps(appConfig(), appManifest());

			waitsFor(function() {
				return done;
			}, 1000);

			runs(function() {
				expect(rootParentId).toEqual($testContainer.attr('id'));
			});
		});

		it('throws if callback is specified, but appConfig.root is not set', function() {
			F2.AppHandlers.on(
				containerToken,
				F2.Constants.AppHandlers.APP_RENDER,
				function() {}
			);

			expect(function() {
				F2.init();
				F2.registerApps(appConfig(), appManifest());
			}).toThrow();
		});

	});

	describe('APP_RENDER_AFTER', function() {

		it('should pass appConfig and app html to callback', function() {
			var done = false;
			var passedConfig;

			F2.AppHandlers.on(
				containerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function(appConfig) {
					appConfig.root = document.body;
					passedConfig = appConfig;
					done = true;
				}
			);

			var config = appConfig();
			F2.init();
			F2.registerApps(config, appManifest());

			waitsFor(function() {
				return done;
			}, 1000);

			runs(function() {
				expect(passedConfig.appId).toEqual(config.appId);
				expect(passedConfig.manifestUrl).toEqual(config.manifestUrl);
			});
		});

		it('should fire after app is in DOM', function() {
			var done = false;
			var rootOnPage = false;

			F2.AppHandlers.on(
				containerToken,
				F2.Constants.AppHandlers.APP_RENDER_AFTER,
				function(appConfig) {
					rootOnPage = $(appConfig.root).parents('body:first').length > 0;
					done = true;
				}
			);

			F2.init();
			F2.registerApps(appConfig(), appManifest());

			waitsFor(function() {
				return done;
			}, 1000);

			runs(function() {
				expect(rootOnPage).toBe(true);
			});
		});

	});

	describe('APP_DESTROY_BEFORE', function() {

		it('should run before app\'s "destroy" method is called', function() {
			var appDestroyCalled = false;
			var destroyHandlerCalled = false;

			F2.Apps['test-app'] = (function() {
				var AppClass = function() {};

				AppClass.prototype = {
					destroy: function() {
						appDestroyCalled = true;
					}
				};

				return AppClass;
			})();

			F2.AppHandlers.on(
				containerToken,
				F2.Constants.AppHandlers.APP_DESTROY_BEFORE,
				function() {
					destroyHandlerCalled = true;
					expect(appDestroyCalled).toBe(false);
				}
			);

			F2.init();
			F2.registerApps({
				appId: 'test-app',
				root: $('<app />').appendTo(document.body).get(0)
			});

			// TODO: remove need for setTimeout
			setTimeout(function() {
				F2.removeAllApps();
			}, 0);

			waitsFor(function() {
				return destroyHandlerCalled;
			}, 1000);
		});

	});

	describe('APP_DESTROY', function() {
		
		it('should prevent app\'s "destroy" method from being called automatically', function() {
			var appDestroyCalled = false;
			var destroyHandlerCalled = false;

			F2.Apps['test-app'] = (function() {
				var AppClass = function() {};

				AppClass.prototype = {
					destroy: function() {
						appDestroyCalled = true;
					}
				};

				return AppClass;
			})();

			F2.AppHandlers.on(
				containerToken,
				F2.Constants.AppHandlers.APP_DESTROY,
				function() {}
			);
			F2.AppHandlers.on(
				containerToken,
				F2.Constants.AppHandlers.APP_DESTROY_AFTER,
				function() {
					destroyHandlerCalled = true;
				}
			);

			F2.init();
			F2.registerApps({
				appId: 'test-app',
				root: $('<app />').appendTo(document.body).get(0)
			});

			// I don't know why this needs to be in a setTimeout
			// TODO: remove need for setTimeout
			setTimeout(function() {
				F2.removeAllApps();
			}, 0);

			waitsFor(function() {
				return destroyHandlerCalled;
			}, 3000);

			runs(function() {
				expect(appDestroyCalled).toBe(false);
			});
		});

	});

	describe('APP_DESTROY_AFTER', function() {

		it('should run after app\'s "destroy" method is called', function() {
			var appDestroyCalled = false;
			var destroyHandlerCalled = false;

			F2.Apps['test-app'] = (function() {
				var AppClass = function() {};

				AppClass.prototype = {
					destroy: function() {
						appDestroyCalled = true;
					}
				};

				return AppClass;
			})();

			F2.AppHandlers.on(
				containerToken,
				F2.Constants.AppHandlers.APP_DESTROY_AFTER,
				function() {
					destroyHandlerCalled = true;
					expect(appDestroyCalled).toBe(true);
				}
			);

			F2.init();
			F2.registerApps({
				appId: 'test-app',
				root: $('<app />').appendTo(document.body).get(0)
			});

			// TODO: remove need for setTimeout
			setTimeout(function() {
				F2.removeAllApps();
			}, 0);

			waitsFor(function() {
				return destroyHandlerCalled;
			}, 1000);
		});

	});

	describe('APP_SCRIPT_LOAD_FAILED',function() {

		function appManifest() {
			return {
				scripts: [],
				styles: [],
				inlineScripts: [],
				apps: [{
					html: '<div class="test-app">Testing</div>'
				}]
			};
		};

		it('should fire with invalid script path', function() {
			var errorHandlerFired = false;

			F2.AppHandlers.on(
				containerToken,
				F2.Constants.AppHandlers.APP_SCRIPT_LOAD_FAILED,
				function(appConfig, scriptInfo) {
					errorHandlerFired = true;
				}
			);

			var manifest = appManifest();
			manifest.scripts.push('http://localhost:8080/doesNotExist.js');

			F2.init();
			F2.registerApps(appConfig(), manifest);

			waitsFor(function() {
				return errorHandlerFired;
			}, 1000);

			runs(function() {
				expect(errorHandlerFired).toBe(true);
			});
		});

		it('should fire with invalid inline scripts', function() {
			var errorHandlerFired = false;

			F2.AppHandlers.on(
				containerToken,
				F2.Constants.AppHandlers.APP_SCRIPT_LOAD_FAILED,
				function(appConfig, scriptInfo) {
					errorHandlerFired = true;
				}
			);

			var manifest = appManifest();
			manifest.inlineScripts.push('asdf()');

			F2.init();
			F2.registerApps(appConfig(), manifest);

			waitsFor(function() {
				return errorHandlerFired;
			}, 1000);

			runs(function() {
				expect(errorHandlerFired).toBe(true);
			});
		});

	});

});
