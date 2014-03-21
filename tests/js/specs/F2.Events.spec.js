define(['F2'], function(F2) {

	describe('F2.Events', function() {

		beforeEach(function() {
			window.events = {};
		});

		function MockClass() {
			this.didIt = true;
			this.__f2Disposed__ = false;

			this.handler = function() {
				window.events.context = this;
			};

			this.handler2 = function() {
				window.events.context2 = this;
			};

			F2.Events.on('__test-mock__', this.handler);
			F2.Events.on('__test-mock2__', this.handler2);

			this.dispose = function() {
				this.__f2Disposed__ = true;
				F2.Events.off(this.handler);
				F2.Events.off(this.handler2);
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
				F2.Events.off(handler);

				expect(window.events.emit).toBe(true);
			});

			it('should pass all arguments to emitted event', function() {
				function handler(first, second) {
					window.events.emit = [first, second];
				}
				F2.Events.on('__test-emit__', handler);
				F2.Events.emit('__test-emit__', 1, 2);
				F2.Events.off(handler);

				expect(window.events.emit[0]).toBe(1);
				expect(window.events.emit[1]).toBe(2);
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

			it('should throw if name is passed without handler', function() {
				function attempt() {
					F2.Events.off('__foo__');
				}

				expect(attempt).toThrow();
			});

			it('should not throw if an unrecognized name or handler is passed', function() {
				function attempt() {
					F2.Events.off('__notdefined__', function() {});
				}

				expect(attempt).not.toThrow();
			});

			it('should unsubscribe by passing name and handler', function() {
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

			it('should unsubscribe by passing only handler', function() {
				var handler = function() {
					window.events.off = true;
				};
				F2.Events.on('__test-off__', handler);
				F2.Events.on('__test-off2__', handler);
				F2.Events.off(handler);
				F2.Events.emit('__test-off__');
				F2.Events.emit('__test-off2__');

				expect(window.events.off).not.toBeDefined();
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

			if('should throw if the handler isn\'t a function', function() {
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
