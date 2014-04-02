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
					F2.Events.emit();
				}

				expect(attempt).toThrow();
			});

			it('should not throw if passed an unrecognized event name', function() {
				function attempt() {
					F2.Events.emit('__test-undefined__', {});
				}

				expect(attempt).not.toThrow();
			});

			it('should call handlers for a registered event', function(done) {
				F2.load(getConfigs('com_test_basic'), function(manifests) {
					F2.Events.emit('com_test_basic-args');
					expect(window.test.com_test_basic.eventArgs).toBeDefined();
					done();
					F2.remove(manifests);
				});
			});

			it('should pass all arguments to emitted event', function(done) {
				F2.load(getConfigs('com_test_basic'), function(manifests) {
					F2.Events.emit('com_test_basic-args', 1, 2, 3);
					expect(window.test.com_test_basic.eventArgs.length).toBe(3);
					done();
					F2.remove(manifests);
				});
			});

			it('should execute handlers in the context passed', function(done) {
				F2.load(getConfigs('com_test_basic'), function(manifests) {
					F2.Events.emit('com_test_basic-context');
					expect(window.test.com_test_basic.handlerContext).toBe(window.test.com_test_basic.instance);
					done();
					F2.remove(manifests);
				});
			});

			it('should not run disposed handlers', function(done) {
				F2.load(getConfigs('com_test_basic'), function(manifests) {
					F2.remove(manifests);
					F2.Events.emit('com_test_basic-args');
					expect(window.test.com_test_basic).not.toBeDefined();
					done();
				});
			});

		});

		describe('emitTo', function() {

			it('should throw if no event name is passed', function() {
				function attempt() {
					F2.Events.emitTo([]);
				}

				expect(attempt).toThrow();
			});

			it('should throw if no filters are provided', function() {
				function attempt() {
					F2.Events.emitTo(null, 'test');
				}

				expect(attempt).toThrow();
			});

			it('should not throw if passed an unrecognized event name', function() {
				function attempt() {
					F2.Events.emitTo([], '__test-undefined__', {});
				}

				expect(attempt).not.toThrow();
			});

			it('should not throw if passed an unknown filter', function() {
				function attempt() {
					F2.Events.emitTo(['asdf'], 'test');
				}

				expect(attempt).not.toThrow();
			});

			it('should not throw if an empty array of filters is provided', function() {
				function attempt() {
					F2.Events.emitTo([], 'test');
				}

				expect(attempt).not.toThrow();
			});

			it('should not match anything if an empty array of filters is provided', function(done) {
				F2.load(getConfigs(['com_test_basic']), function(manifests) {
					// Target both of the apps
					// This should pass if both apps are fired
					F2.Events.emitTo([], 'generic_test_event');
					expect(window.test.generic_test_event).not.toBeDefined();
					F2.remove(manifests);
					done();
				});
			});

			it('should call handlers for a registered event with instanceId as a filter', function(done) {
				F2.load(getConfigs(['com_test_duplicate', 'com_test_duplicate']), function(manifests) {
					// Target one of the duplicate apps
					F2.Events.emitTo([manifests[0].instanceId], 'generic_test_event');
					expect(window.test.generic_test_event).toBe(1);
					F2.remove(manifests);
					done();
				});
			});

			it('should call handlers for a registered event with appId as a filter', function(done) {
				var configs = getConfigs(['com_test_duplicate', 'com_test_duplicate']);

				F2.load(configs, function(apps) {
					// Target both of the apps
					F2.Events.emitTo(['com_test_duplicate'], 'generic_test_event');
					expect(window.test.generic_test_event).toBe(2);
					F2.remove(apps);
					done();
				});
			});

			it('should apply filters greedily (inclusively)', function(done) {
				var configs = getConfigs(['com_test_basic', 'com_test_duplicate']);

				F2.load(configs, function(apps) {
					// Target both of the apps
					// This should pass if both apps are fire4d
					F2.Events.emitTo(['com_test_duplicate', 'com_test_basic'], 'generic_test_event');
					expect(window.test.generic_test_event).toBe(2);
					F2.remove(apps);
					done();
				});
			});

			it('should pass all arguments to emitted event', function(done) {
				F2.load(getConfigs('com_test_basic'), function(manifests) {
					F2.Events.emitTo(['com_test_basic'], 'com_test_basic-args', 1, 2, 3);
					expect(window.test.com_test_basic.eventArgs.length).toBe(3);
					F2.remove(manifests);
					done();
				});
			});

			it('should execute handlers in the context passed', function(done) {
				F2.load(getConfigs('com_test_basic'), function(manifests) {
					F2.Events.emitTo(['com_test_basic'], 'com_test_basic-context');
					expect(window.test.com_test_basic.handlerContext).toBe(window.test.com_test_basic.instance);
					F2.remove(manifests);
					done();
				});
			});

			it('should not run disposed handlers', function(done) {
				F2.load(getConfigs('com_test_basic'), function(manifests) {
					F2.remove(manifests);
					F2.Events.emitTo(['com_test_basic'], 'com_test_basic-args');
					expect(window.test.com_test_basic).not.toBeDefined();
					done();
				});
			});

		});

		describe('many', function() {

			it('should throw if no context is passed', function() {
				function attempt() {
					F2.Events.many(null, "test", 10, function() {});
				}

				expect(attempt).toThrow();
			});

			it('should throw if context is not an app instantiated by F2', function() {
				function attempt() {
					var fakeApp = function() { };
					F2.Events.many(new fakeApp(), "test", 10, function() { });
				}

				expect(attempt).toThrow();
			});

			it('should not throw if context is an app instantiated by F2', function(done) {
				F2.load(getConfigs('com_test_basic'), function(manifests) {
					function attempt() {
						F2.Events.many(window.test.com_test_basic.instance, "test", 10, function() { });
					}
					expect(attempt).not.toThrow();
					F2.remove(manifests);
					done();
				});
			});

			it('should throw if no name is passed', function(done) {
				F2.load(getConfigs('com_test_basic'), function(manifests) {
					function attempt() {
						F2.Events.many(window.test.com_test_basic.instance, null, 10, function() { });
					}
					expect(attempt).toThrow();
					F2.remove(manifests);
					done();
				});
			});

			it('should throw if no handler is passed', function(done) {
				F2.load(getConfigs('com_test_basic'), function(manifests) {
					function attempt() {
						F2.Events.many(window.test.com_test_basic.instance, "test", 10, null);
					}
					expect(attempt).toThrow();
					F2.remove(manifests);
					done();
				});
			});

			it('should throw if no count is passed', function(done) {
				F2.load(getConfigs('com_test_basic'), function(manifests) {
					function attempt() {
						F2.Events.many(window.test.com_test_basic.instance, "test", null, function() { });
					}
					expect(attempt).toThrow();
					F2.remove(manifests);
					done();
				});
			});

			it('should throw if count is NaN, negative, or 0', function(done) {
				F2.load(getConfigs('com_test_basic'), function(manifests) {
					function attemptZero() {
						F2.Events.many(window.test.com_test_basic.instance, "test", 0, function() { });
					}
					function attemptNegative() {
						F2.Events.many(window.test.com_test_basic.instance, "test", -1, function() { });
					}
					function attemptNaN() {
						F2.Events.many(window.test.com_test_basic.instance, "test", "foo", function() { });
					}
					expect(attemptZero).toThrow();
					expect(attemptNegative).toThrow();
					expect(attemptNaN).toThrow();
					F2.remove(manifests);
					done();
				});
			});

			it('should only call handlers the specified number of times', function(done) {
				F2.load(getConfigs('com_test_basic'), function(manifests) {
					// Execute 4 times
					F2.Events.emit('com_test_basic-many');
					F2.Events.emit('com_test_basic-many');
					F2.Events.emit('com_test_basic-many');
					F2.Events.emit('com_test_basic-many');
					// Handler should have only fired 3 times
					expect(window.test.com_test_basic.count).toBe(3);
					F2.remove(manifests);
					done();
				});
			});

		});

		describe('off', function() {

			it('should throw if no params are passed', function() {
				function attempt() {
					F2.Events.off();
				}
				expect(attempt).toThrow();
			});

			it('should throw if name is passed without handler or context', function() {
				function attempt() {
					F2.Events.off(null, '__foo__', null);
				}
				expect(attempt).toThrow();
			});

			it('should not throw if an unrecognized name, handler, or context is passed', function() {
				function attempt() {
					F2.Events.off(null, '__notdefined__', function() {});
				}
				expect(attempt).not.toThrow();
			});

			it('should unsubscribe by passing name and handler', function(done) {
				F2.load(getConfigs('com_test_basic'), function(manifests) {
					F2.Events.off(null, 'com_test_basic-args', window.test.com_test_basic.instance.handleArgs);
					F2.Events.emit('com_test_basic-args');
					expect(window.test.com_test_basic.eventArgs).not.toBeDefined();
					F2.remove(manifests);
					done();
				});
			});

			it('should unsubscribe by passing only handler', function(done) {
				F2.load(getConfigs('com_test_basic'), function(manifests) {
					F2.Events.off(null, null, window.test.com_test_basic.instance.handleArgs);
					F2.Events.emit('com_test_basic-args');
					expect(window.test.com_test_basic.eventArgs).not.toBeDefined();
					F2.remove(manifests);
					done();
				});
			});

			it('should unsubscribe by passing name and context', function(done) {
				F2.load(getConfigs('com_test_basic'), function(manifests) {
					F2.Events.off(window.test.com_test_basic.instance, 'com_test_basic-args');
					F2.Events.emit('com_test_basic-args');
					expect(window.test.com_test_basic.eventArgs).not.toBeDefined();
					F2.remove(manifests);
					done();
				});
			});

			it('should unsubscribe by passing only context', function(done) {
				F2.load(getConfigs('com_test_basic'), function(manifests) {
					F2.Events.off(window.test.com_test_basic.instance);
					F2.Events.emit('com_test_basic-args');
					expect(window.test.com_test_basic.eventArgs).not.toBeDefined();
					F2.remove(manifests);
					done();
				});
			});

			it('should unsubscribe by passing name, handler, and context', function(done) {
				F2.load(getConfigs('com_test_basic'), function(manifests) {
					F2.Events.off(
						window.test.com_test_basic.instance,
						'com_test_basic-args',
						window.test.com_test_basic.instance.handleArgs
					);
					F2.Events.emit('com_test_basic-args');
					expect(window.test.com_test_basic.eventArgs).not.toBeDefined();
					F2.remove(manifests);
					done();
				});
			});

		});

		describe('on', function() {

			it('should throw if no context is passed', function() {
				function attempt() {
					F2.Events.on(null, "test", function() {});
				}

				expect(attempt).toThrow();
			});

			it('should throw if context is not an app instantiated by F2', function() {
				function attempt() {
					var fakeApp = function() { };
					F2.Events.on(new fakeApp(), "test", function() { });
				}

				expect(attempt).toThrow();
			});

			it('should not throw if context is an app instantiated by F2', function(done) {
				F2.load(getConfigs('com_test_basic'), function(manifests) {
					function attempt() {
						F2.Events.on(window.test.com_test_basic.instance, "test", function() { });
					}
					expect(attempt).not.toThrow();
					F2.remove(manifests);
					done();
				});
			});

			it('should throw if no name is passed', function(done) {
				F2.load(getConfigs('com_test_basic'), function(manifests) {
					function attempt() {
						F2.Events.on(window.test.com_test_basic.instance, null, function() { });
					}
					expect(attempt).toThrow();
					F2.remove(manifests);
					done();
				});
			});

			it('should throw if no handler is passed', function(done) {
				F2.load(getConfigs('com_test_basic'), function(manifests) {
					function attempt() {
						F2.Events.on(window.test.com_test_basic.instance, "test", null);
					}
					expect(attempt).toThrow();
					F2.remove(manifests);
					done();
				});
			});

		});

		describe('once', function() {

			it('should throw if no context is passed', function() {
				function attempt() {
					F2.Events.once(null, "test", function() {});
				}

				expect(attempt).toThrow();
			});

			it('should throw if context is not an app instantiated by F2', function() {
				function attempt() {
					var fakeApp = function() { };
					F2.Events.once(new fakeApp(), "test", function() { });
				}

				expect(attempt).toThrow();
			});

			it('should not throw if context is an app instantiated by F2', function(done) {
				F2.load(getConfigs('com_test_basic'), function(manifests) {
					function attempt() {
						F2.Events.once(window.test.com_test_basic.instance, "test", function() { });
					}
					expect(attempt).not.toThrow();
					F2.remove(manifests);
					done();
				});
			});

			it('should throw if no name is passed', function(done) {
				F2.load(getConfigs('com_test_basic'), function(manifests) {
					function attempt() {
						F2.Events.once(window.test.com_test_basic.instance, null, function() { });
					}
					expect(attempt).toThrow();
					F2.remove(manifests);
					done();
				});
			});

			it('should throw if no handler is passed', function(done) {
				F2.load(getConfigs('com_test_basic'), function(manifests) {
					function attempt() {
						F2.Events.once(window.test.com_test_basic.instance, "test", null);
					}
					expect(attempt).toThrow();
					F2.remove(manifests);
					done();
				});
			});

			it('should only call handler once', function(done) {
				F2.load(getConfigs('com_test_basic'), function(manifests) {
					// Execute twice
					F2.Events.emit('com_test_basic-once');
					F2.Events.emit('com_test_basic-once');
					// Handler should have only fired once
					expect(window.test.com_test_basic.count).toBe(1);
					F2.remove(manifests);
					done();
				});
			});

		});

	});

});
