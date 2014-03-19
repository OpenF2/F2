define(['jasmine', 'F2'], function() {

	describe('F2.Events', function() {

		var F2 = require('F2');

		beforeEach(function() {
			window.events = {};
		});

		function MockClass() {
			this.didIt = true;
			this.__f2Disposed__ = false;
			function handler() {
				window.events.context = this;
			};

			function handler2() {
				window.events.context2 = this;
			};

			F2.Events.on('__test-mock__', handler, this);
			F2.Events.on('__test-mock2__', handler2, this);

			this.dispose = function() {
				this.__f2Disposed__ = true;
				F2.Events.off(null, null, this);
			};
		}

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

			it('should call handlers for a registered event', function() {
				function handler() {
					window.events.emit = true;
				}
				F2.Events.on('__test-emit__', handler);
				F2.Events.emit('__test-emit__');
				F2.Events.off(null, handler);

				expect(window.events.emit).toBe(true);
			});

			it('should pass all arguments to emitted event', function() {
				function handler(first, second) {
					window.events.emit = [first, second];
				}
				F2.Events.on('__test-emit__', handler);
				F2.Events.emit('__test-emit__', 1, 2);
				F2.Events.off(null, handler);

				expect(window.events.emit[0] === 1 && window.events.emit[1] === 2).toBe(true);
			});

			it('should not run disposed handlers', function() {
				var mock = new MockClass();

				mock.dispose();
				F2.Events.emit("__test-mock__");
				expect(window.events.context).not.toBeDefined();
			});

		});

		describe('many', function() {

			it('should throw if no event name is passed', function() {
				function attempt() {
					F2.Events.many();
				}

				expect(attempt).toThrow();
			});

			it('should throw if no handler is passed', function() {
				function attempt() {
					F2.Events.many('__test-many__');
				}

				expect(attempt).toThrow();
			});

			it('should throw if no count is passed', function() {
				function attempt() {
					F2.Events.many('__test-many__', null, function() {});
				}

				expect(attempt).toThrow();
			});

			it('should only call handlers the specified number of times', function() {
				window.events.count = 0;

				function handler() {
					window.events.count += 1;
				}

				F2.Events.many('__test-many__', 2, handler);
				F2.Events.emit('__test-many__');
				F2.Events.emit('__test-many__');
				F2.Events.emit('__test-many__'); // Should not run

				expect(window.events.count).toBe(2);
			});

			if('should throw if \'howMany\' isNaN', function(){
				function attempt() {
					F2.Events.many('__test-many__', "a", function(){ });
				}
				expect(attempt).toThrow();
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
					F2.Events.off('__foo__');
				}

				expect(attempt).toThrow();
			});

			it('should not throw if an unrecognized name, handler, or context is passed', function() {
				function attempt() {
					F2.Events.off('__notdefined__', function() {}, window);
				}

				expect(attempt).not.toThrow();
			});

			it('should unsubscribe from specific events by passing name and handler', function() {
				var handler = function() {
					window.events.off = true;
				};
				F2.Events.on('__test-off__', handler);
				F2.Events.on('__test-off2__', handler);
				F2.Events.off('__test-off__', handler);

				// Trigger the event we're unsubscribed from
				F2.Events.emit('__test-off__');
				expect(window.events.off).not.toBeDefined();

				F2.Events.emit('__test-off2__');
				expect(window.events.off).toBe(true);
				F2.Events.off('__test-off2__', handler);
			});

			it('should unsubscribe from all events only passing handler', function() {
				var handler = function() {
					window.events.off = true;
				};
				F2.Events.on('__test-off__', handler);
				F2.Events.on('__test-off2__', handler);
				F2.Events.off(null, handler);
				F2.Events.emit('__test-off__');
				F2.Events.emit('__test-off2__');

				expect(window.events.off).not.toBeDefined();
			});

			it('should unsubscribe from specific events by passing name and context', function() {
				var mock = new MockClass();

				// Unsub from the first event
				F2.Events.off('__test-mock__', null, mock);

				// Emit both events
				F2.Events.emit('__test-mock__');
				F2.Events.emit('__test-mock2__');

				// The first should be undefined, but the second should have run
				expect(window.events.context).not.toBeDefined();
				expect(window.events.context2).toBeDefined();

				mock.dispose();
			});

			it('should unsubscribe from all events only passing context', function() {
				var mock = new MockClass();

				// Unsub from the first event
				F2.Events.off(null, null, mock);

				// Emit both events
				F2.Events.emit('__test-mock__');
				F2.Events.emit('__test-mock2__');

				// The first should be undefined, but the second should have run
				expect(window.events.context).not.toBeDefined();
				expect(window.events.context2).not.toBeDefined();

				mock.dispose();
			});

		});

		describe('on', function() {

			it('should throw without an event name', function() {
				function attempt() {
					F2.Events.on(null, function() {});
				}
				expect(attempt).toThrow();
			});

			it('should throw without a handler', function() {
				function attempt() {
					F2.Events.on('__test-on__', null);
				}
				expect(attempt).toThrow();
			});

			it('should allow you to subscribe without context', function() {
				var handler = function() {
					window.events.on = true;
				};
				F2.Events.on('__test-on__', handler);
				F2.Events.off('__test-on__', handler);
				F2.Events.emit('__test-on__');

				expect(window.events.on).not.toBeDefined();
			});

			it('should allow you to subscribe with context', function() {
				var mock = new MockClass();
				F2.Events.emit('__test-mock__');
				F2.Events.off('__test-mock__', null, mock);

				expect(window.events.context).toBeDefined();

				mock.dispose();
			});

			it('should execute the handler in the provided context', function() {
				var mock = new MockClass();
				F2.Events.emit('__test-mock__');
				F2.Events.off('__test-mock__', null, mock);

				expect(window.events.context === mock).toBe(true);

				mock.dispose();
			});

			if('should throw if the handler doesn\'t have an "apply" method', function() {
				function attempt() {
					F2.Events.on("__test-on__", {});
				}
				expect(attempt).toThrow();
			});

		});

		describe('once', function() {

			it('should throw if no event name is passed', function() {
				function attempt() {
					F2.Events.once();
				}

				expect(attempt).toThrow();
			});

			it('should throw if no handler is passed', function() {
				function attempt() {
					F2.Events.once('__test-once__');
				}

				expect(attempt).toThrow();
			});

			it('should only call handlers once', function() {
				window.events.count = 0;

				function handler() {
					window.events.count += 1;
				}

				F2.Events.once('__test-once__', handler);
				F2.Events.emit('__test-once__');
				F2.Events.emit('__test-once__'); // Should not run

				expect(window.events.count).toBe(1);
			});

		});

	});

});