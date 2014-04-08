define(['F2', 'testHelpers'], function(F2, helpers) {

	function getConfigs(appIds) {
		appIds = [].concat(appIds);
		var configs = [];

		for (var i = 0; i < appIds.length; i++) {
			configs.push({
				appId: appIds[i],
				manifestUrl: '/apps/single'
			});
		}

		return configs;
	}

	describe('F2.Events', function() {

		beforeEach(function() {
			window.events = {};
		});

		describe('emit', function() {

			it('should throw if no event name is passed', function() {
				function attempt() {
					F2.emit();
				}

				function attempt2() {
					F2.emit([]);
				}

				expect(attempt).toThrow();
				expect(attempt2).toThrow();
			});

			it('should not throw if passed an unrecognized event name', function() {
				function attempt() {
					F2.emit('__test-undefined__');
				}

				expect(attempt).not.toThrow();
			});

			it('should call handlers for a registered event', function(done) {
				F2.load(getConfigs('com_test_basic'), function(manifests) {
					F2.emit('com_test_basic-context');
					expect(window.test.com_test_basic.handlerContext).toBeDefined();
					F2.unload(manifests);
					done();
				});
			});

			it('should pass arguments to event handler', function(done) {
				F2.load(getConfigs('com_test_basic'), function(manifests) {
					F2.emit('com_test_basic-args', 1, 2, 3);
					expect(window.test.com_test_basic.eventArgs.length).toBe(3);
					F2.unload(manifests);
					done();
				});
			});

			it('should execute handlers in the context passed', function(done) {
				F2.load(getConfigs('com_test_basic'), function(manifests) {
					F2.emit('com_test_basic-context');
					expect(window.test.com_test_basic.handlerContext).toBe(window.test.com_test_basic.instance);
					F2.unload(manifests);
					done();
				});
			});

			it('should not run disposed handlers', function(done) {
				F2.load(getConfigs('com_test_basic'), function(manifests) {
					F2.unload(manifests);
					F2.emit('com_test_basic-args');
					expect(window.test.com_test_basic).not.toBeDefined();
					done();
				});
			});

			it('should not throw if passed an unknown filter', function() {
				function attempt() {
					F2.emit(['asdf'], 'test');
				}

				expect(attempt).not.toThrow();
			});

			it('should not throw if an empty array of filters is provided', function() {
				function attempt() {
					F2.emit([], 'test');
				}

				expect(attempt).not.toThrow();
			});

			it('should not match anything if an empty array of filters is provided', function(done) {
				F2.load(getConfigs(['com_test_basic']), function(manifests) {
					// Target both of the apps
					// This should pass if both apps are fired
					F2.emit([], 'generic_test_event');
					expect(window.test.generic_test_event).not.toBeDefined();
					F2.unload(manifests);
					done();
				});
			});

			it('should call handlers for a registered event with instanceId as a filter', function(done) {
				F2.load(getConfigs(['com_test_duplicate', 'com_test_duplicate']), function(manifests) {
					// Target one of the duplicate apps
					F2.emit([manifests[0].instanceId], 'generic_test_event');
					expect(window.test.generic_test_event).toBe(1);
					F2.unload(manifests);
					done();
				});
			});

			it('should call handlers for a registered event with appId as a filter', function(done) {
				var configs = getConfigs(['com_test_duplicate', 'com_test_duplicate']);

				F2.load(configs, function(apps) {
					// Target both of the apps
					F2.emit(['com_test_duplicate'], 'generic_test_event');
					expect(window.test.generic_test_event).toBe(2);
					F2.unload(apps);
					done();
				});
			});

			it('should apply filters greedily (inclusively)', function(done) {
				var configs = getConfigs(['com_test_basic', 'com_test_duplicate']);

				F2.load(configs, function(apps) {
					// Target both of the apps
					// This should pass if both apps are fired
					F2.emit(['com_test_duplicate', 'com_test_basic'], 'generic_test_event');
					expect(window.test.generic_test_event).toBe(2);
					F2.unload(apps);
					done();
				});
			});

		});

		describe('off', function() {

			it('should throw if no params are passed', function() {
				function attempt() {
					F2.off();
				}
				expect(attempt).toThrow();
			});

			it('should throw if name is passed without handler or context', function() {
				function attempt() {
					F2.off(null, '__foo__', null);
				}
				expect(attempt).toThrow();
			});

			it('should not throw if an unrecognized name, handler, or context is passed', function() {
				function attempt() {
					F2.off(null, '__notdefined__', function() {});
				}
				expect(attempt).not.toThrow();
			});

			it('should unsubscribe by passing name and handler', function(done) {
				F2.load(getConfigs('com_test_basic'), function(manifests) {
					F2.off(null, 'com_test_basic-args', window.test.com_test_basic.instance.handleArgs);
					F2.emit('com_test_basic-args');
					expect(window.test.com_test_basic.eventArgs).not.toBeDefined();
					F2.unload(manifests);
					done();
				});
			});

			it('should unsubscribe by passing only handler', function(done) {
				F2.load(getConfigs('com_test_basic'), function(manifests) {
					F2.off(null, null, window.test.com_test_basic.instance.handleArgs);
					F2.emit('com_test_basic-args');
					expect(window.test.com_test_basic.eventArgs).not.toBeDefined();
					F2.unload(manifests);
					done();
				});
			});

			it('should unsubscribe by passing name and context', function(done) {
				F2.load(getConfigs('com_test_basic'), function(manifests) {
					F2.off(window.test.com_test_basic.instance, 'com_test_basic-args');
					F2.emit('com_test_basic-args');
					expect(window.test.com_test_basic.eventArgs).not.toBeDefined();
					F2.unload(manifests);
					done();
				});
			});

			it('should unsubscribe by passing only context', function(done) {
				F2.load(getConfigs('com_test_basic'), function(manifests) {
					F2.off(window.test.com_test_basic.instance);
					F2.emit('com_test_basic-args');
					expect(window.test.com_test_basic.eventArgs).not.toBeDefined();
					F2.unload(manifests);
					done();
				});
			});

			it('should unsubscribe by passing name, handler, and context', function(done) {
				F2.load(getConfigs('com_test_basic'), function(manifests) {
					F2.off(
						window.test.com_test_basic.instance,
						'com_test_basic-args',
						window.test.com_test_basic.instance.handleArgs
					);
					F2.emit('com_test_basic-args');
					expect(window.test.com_test_basic.eventArgs).not.toBeDefined();
					F2.unload(manifests);
					done();
				});
			});

		});

		describe('on', function() {

			it('should throw if no context is passed', function() {
				function attempt() {
					F2.on(null, "test", function() {});
				}

				expect(attempt).toThrow();
			});

			it('should throw if context is not an app instantiated by F2', function() {
				function attempt() {
					var fakeApp = function() { };
					F2.on(new fakeApp(), "test", function() { });
				}

				expect(attempt).toThrow();
			});

			it('should not throw if context is an app instantiated by F2', function(done) {
				F2.load(getConfigs('com_test_basic'), function(manifests) {
					function attempt() {
						F2.on(window.test.com_test_basic.instance, "test", function() { });
					}
					expect(attempt).not.toThrow();
					F2.unload(manifests);
					done();
				});
			});

			it('should throw if no name is passed', function(done) {
				F2.load(getConfigs('com_test_basic'), function(manifests) {
					function attempt() {
						F2.on(window.test.com_test_basic.instance, null, function() { });
					}
					expect(attempt).toThrow();
					F2.unload(manifests);
					done();
				});
			});

			it('should throw if no handler is passed', function(done) {
				F2.load(getConfigs('com_test_basic'), function(manifests) {
					function attempt() {
						F2.on(window.test.com_test_basic.instance, "test", null);
					}
					expect(attempt).toThrow();
					F2.unload(manifests);
					done();
				});
			});

			it('should throw if count is NaN, negative, or 0', function(done) {
				F2.load(getConfigs('com_test_basic'), function(manifests) {
					function attemptZero() {
						F2.on(window.test.com_test_basic.instance, "test", function() { }, 0);
					}
					function attemptNegative() {
						F2.on(window.test.com_test_basic.instance, "test", function() { }, -1);
					}
					function attemptNaN() {
						F2.on(window.test.com_test_basic.instance, "test", function() { }, "foo");
					}
					expect(attemptZero).toThrow();
					expect(attemptNegative).toThrow();
					expect(attemptNaN).toThrow();
					F2.unload(manifests);
					done();
				});
			});

			it('should only call handlers the specified number of times', function(done) {
				F2.load(getConfigs('com_test_basic'), function(manifests) {
					// Execute 4 times
					F2.emit('com_test_basic-many');
					F2.emit('com_test_basic-many');
					F2.emit('com_test_basic-many');
					F2.emit('com_test_basic-many');
					// Handler should have only fired 3 times
					expect(window.test.com_test_basic.count).toBe(3);
					F2.unload(manifests);
					done();
				});
			});

		});

	});

});
