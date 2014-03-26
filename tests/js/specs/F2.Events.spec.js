define(['F2', 'testHelpers'], function(F2, helpers) {

	function getAppConfigsFor(appIds) {
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
				F2.load({
					appConfigs: getAppConfigsFor('com_test_basic'),
					complete: function() {
						F2.Events.emit('com_test_basic-args');
						expect(window.test.com_test_basic.eventArgs).toBeDefined();
						done();
						F2.remove(window.test.com_test_basic.instance);
					}
				});
			});

			it('should pass all arguments to emitted event', function(done) {
				F2.load({
					appConfigs: getAppConfigsFor('com_test_basic'),
					complete: function() {
						F2.Events.emit('com_test_basic-args', 1, 2, 3);
						expect(window.test.com_test_basic.eventArgs.length).toBe(3);
						done();
						F2.remove(window.test.com_test_basic.instance);
					}
				});
			});

			it('should execute handlers in the context passed', function(done) {
				F2.load({
					appConfigs: getAppConfigsFor('com_test_basic'),
					complete: function() {
						F2.Events.emit('com_test_basic-context');
						expect(window.test.com_test_basic.handlerContext).toBe(window.test.com_test_basic.instance);
						done();
						F2.remove(window.test.com_test_basic.instance);
					}
				});
			});

			it('should not run disposed handlers', function(done) {
				F2.load({
					appConfigs: getAppConfigsFor('com_test_basic'),
					complete: function() {
						F2.remove(window.test.com_test_basic.instance);
						F2.Events.emit('com_test_basic-args');
						expect(window.test.com_test_basic).not.toBeDefined();
						done();
					}
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
				F2.load({
					appConfigs: getAppConfigsFor('com_test_basic'),
					complete: function() {
						function attempt() {
							F2.Events.many(window.test.com_test_basic.instance, "test", 10, function() { });
						}
						expect(attempt).not.toThrow();
						done();
						F2.remove(window.test.com_test_basic.instance);
					}
				});
			});

			it('should throw if no name is passed', function(done) {
				F2.load({
					appConfigs: getAppConfigsFor('com_test_basic'),
					complete: function() {
						function attempt() {
							F2.Events.many(window.test.com_test_basic.instance, null, 10, function() { });
						}
						expect(attempt).toThrow();
						done();
						F2.remove(window.test.com_test_basic.instance);
					}
				});
			});

			it('should throw if no handler is passed', function(done) {
				F2.load({
					appConfigs: getAppConfigsFor('com_test_basic'),
					complete: function() {
						function attempt() {
							F2.Events.many(window.test.com_test_basic.instance, "test", 10, null);
						}
						expect(attempt).toThrow();
						done();
						F2.remove(window.test.com_test_basic.instance);
					}
				});
			});

			it('should throw if no count is passed', function(done) {
				F2.load({
					appConfigs: getAppConfigsFor('com_test_basic'),
					complete: function() {
						function attempt() {
							F2.Events.many(window.test.com_test_basic.instance, "test", null, function() { });
						}
						expect(attempt).toThrow();
						done();
						F2.remove(window.test.com_test_basic.instance);
					}
				});
			});

			it('should throw if count is NaN, negative, or 0', function(done) {
				F2.load({
					appConfigs: getAppConfigsFor('com_test_basic'),
					complete: function() {
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
						done();
						F2.remove(window.test.com_test_basic.instance);
					}
				});
			});

			it('should only call handlers the specified number of times', function(done) {
				F2.load({
					appConfigs: getAppConfigsFor('com_test_basic'),
					complete: function() {
						// Execute 4 times
						F2.Events.emit('com_test_basic-many');
						F2.Events.emit('com_test_basic-many');
						F2.Events.emit('com_test_basic-many');
						F2.Events.emit('com_test_basic-many');
						// Handler should have only fired 3 times
						expect(window.test.com_test_basic.count).toBe(3);
						done();
						F2.remove(window.test.com_test_basic.instance);
					}
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
				F2.load({
					appConfigs: getAppConfigsFor('com_test_basic'),
					complete: function() {
						F2.Events.off(null, 'com_test_basic-args', window.test.com_test_basic.instance.handleArgs);
						F2.Events.emit('com_test_basic-args');
						expect(window.test.com_test_basic.eventArgs).not.toBeDefined();
						done();
						F2.remove(window.test.com_test_basic.instance);
					}
				});
			});

			it('should unsubscribe by passing only handler', function(done) {
				F2.load({
					appConfigs: getAppConfigsFor('com_test_basic'),
					complete: function() {
						F2.Events.off(
							null,
							null,
							window.test.com_test_basic.instance.handleArgs
						);
						F2.Events.emit('com_test_basic-args');
						expect(window.test.com_test_basic.eventArgs).not.toBeDefined();
						done();
						F2.remove(window.test.com_test_basic.instance);
					}
				});
			});

			it('should unsubscribe by passing name and context', function(done) {
				F2.load({
					appConfigs: getAppConfigsFor('com_test_basic'),
					complete: function() {
						F2.Events.off(
							window.test.com_test_basic.instance,
							'com_test_basic-args'
						);
						F2.Events.emit('com_test_basic-args');
						expect(window.test.com_test_basic.eventArgs).not.toBeDefined();
						done();
						F2.remove(window.test.com_test_basic.instance);
					}
				});
			});

			it('should unsubscribe by passing only context', function(done) {
				F2.load({
					appConfigs: getAppConfigsFor('com_test_basic'),
					complete: function() {
						F2.Events.off(window.test.com_test_basic.instance);
						F2.Events.emit('com_test_basic-args');
						expect(window.test.com_test_basic.eventArgs).not.toBeDefined();
						done();
						F2.remove(window.test.com_test_basic.instance);
					}
				});
			});

			it('should unsubscribe by passing name, handler, and context', function(done) {
				F2.load({
					appConfigs: getAppConfigsFor('com_test_basic'),
					complete: function() {
						F2.Events.off(
							window.test.com_test_basic.instance,
							'com_test_basic-args',
							window.test.com_test_basic.instance.handleArgs
						);
						F2.Events.emit('com_test_basic-args');
						expect(window.test.com_test_basic.eventArgs).not.toBeDefined();
						done();
						F2.remove(window.test.com_test_basic.instance);
					}
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
				F2.load({
					appConfigs: getAppConfigsFor('com_test_basic'),
					complete: function() {
						function attempt() {
							F2.Events.on(window.test.com_test_basic.instance, "test", function() { });
						}
						expect(attempt).not.toThrow();
						done();
						F2.remove(window.test.com_test_basic.instance);
					}
				});
			});

			it('should throw if no name is passed', function(done) {
				F2.load({
					appConfigs: getAppConfigsFor('com_test_basic'),
					complete: function() {
						function attempt() {
							F2.Events.on(window.test.com_test_basic.instance, null, function() { });
						}
						expect(attempt).toThrow();
						done();
						F2.remove(window.test.com_test_basic.instance);
					}
				});
			});

			it('should throw if no handler is passed', function(done) {
				F2.load({
					appConfigs: getAppConfigsFor('com_test_basic'),
					complete: function() {
						function attempt() {
							F2.Events.on(window.test.com_test_basic.instance, "test", null);
						}
						expect(attempt).toThrow();
						done();
						F2.remove(window.test.com_test_basic.instance);
					}
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
				F2.load({
					appConfigs: getAppConfigsFor('com_test_basic'),
					complete: function() {
						function attempt() {
							F2.Events.once(window.test.com_test_basic.instance, "test", function() { });
						}
						expect(attempt).not.toThrow();
						done();
						F2.remove(window.test.com_test_basic.instance);
					}
				});
			});

			it('should throw if no name is passed', function(done) {
				F2.load({
					appConfigs: getAppConfigsFor('com_test_basic'),
					complete: function() {
						function attempt() {
							F2.Events.once(window.test.com_test_basic.instance, null, function() { });
						}
						expect(attempt).toThrow();
						done();
						F2.remove(window.test.com_test_basic.instance);
					}
				});
			});

			it('should throw if no handler is passed', function(done) {
				F2.load({
					appConfigs: getAppConfigsFor('com_test_basic'),
					complete: function() {
						function attempt() {
							F2.Events.once(window.test.com_test_basic.instance, "test", null);
						}
						expect(attempt).toThrow();
						done();
						F2.remove(window.test.com_test_basic.instance);
					}
				});
			});

			it('should only call handler once', function(done) {
				F2.load({
					appConfigs: getAppConfigsFor('com_test_basic'),
					complete: function() {
						// Execute twice
						F2.Events.emit('com_test_basic-once');
						F2.Events.emit('com_test_basic-once');
						// Handler should have only fired once
						expect(window.test.com_test_basic.count).toBe(1);
						done();
						F2.remove(window.test.com_test_basic.instance);
					}
				});
			});

		});

	});

});
