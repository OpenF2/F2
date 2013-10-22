describe('F2', function() {

	var F2 = require('F2');
	var Events = require('F2.Events');

	beforeEach(function() {
		window.test = {};
	});

	describe('config', function() {

		it('should accept arbitrary keys', function() {
			function set() {
				F2.config({
					__test__: true
				});
			}

			expect(set).not.toThrow();
		});

		it('should return current config when called', function() {
			// Test when passing in obj
			var _config = F2.config({
				__test2__: true
			});
			expect(_config.__test2__).toBeDefined();

			// Test with no params
			_config = F2.config();
			expect(_config.__test2__).toBeDefined();
		});

	});

	describe('guid', function() {

		it('should be unique over 100,000 iterations', function() {
			var seen = {};
			var iterations = 100000;
			var allUnique = true;

			while (iterations--) {
				var guid = F2.guid();

				if (seen[guid]) {
					allUnique = false;
					break;
				}

				seen[guid] = true;
			}

			expect(allUnique).toBe(true);
		});

		// http://www.cryptosys.net/pki/uuid-rfc4122.html
		it('should be RFC4122 v4 compliant', function() {
			var guid = F2.guid();
			var complies = false;
			var conditions = [
				// Should be 36 characters
				function() {
					return guid.length === 36;
				},
				// First char of 3rd block should be 4
				// First char of 4th block should be a, b, 8, or 9
				function() {
					return guid[14] === "4"
						&& ({ 8: true, 9: true, a: true, b: true })[guid[19]];
				},
				// There should be 5 blocks
				// Block 1 should be 8 chars
				// Block 2 should be 4 chars
				// Block 3 should be 4 chars
				// Block 4 should be 4 chars
				// Block 5 should be 12 chars
				function() {
					var blocks = guid.split("-");

					return blocks.length === 5
						&& blocks[0].length === 8
						&& blocks[1].length === 4
						&& blocks[2].length === 4
						&& blocks[3].length === 4
						&& blocks[4].length === 12;
				}
			];

			// Test all conditions
			for (var i = 0, len = conditions.length; i < len; i++) {
				complies = conditions[i]();

				if (!complies) {
					break;
				}
			}

			expect(complies).toBe(true);
		});

	});

	describe('load', function() {

		it('should load a single app on same domain', function() {
			F2.load({
				appConfigs: [{
					appId: 'com_test_basic',
					manifestUrl: 'http://localhost:8080/apps/single'
				}]
			});

			waitsFor(function() {
				// Our test classes will throw some properties on the window
				return window.test.com_test_basic;
			}, DEFAULT_TIMEOUT);

			runs(function() {
				expect(window.test.com_test_basic).toBeDefined();

				// Clean up
				F2.removeApp(window.test.com_test_basic.instanceId);
			});
		});

		it('should load multiple unbatched apps on same domain', function() {
			F2.load({
				appConfigs: [
					{ appId: 'com_test_basic', manifestUrl: 'http://localhost:8080/apps/single' },
					{ appId: 'com_test_inherited', manifestUrl: 'http://localhost:8080/apps/single' }
				]
			});

			waitsFor(function() {
				// Our test classes will throw some properties on the window
				return window.test.com_test_basic && window.test.com_test_inherited;
			}, DEFAULT_TIMEOUT);

			runs(function() {
				expect(window.test.com_test_basic).toBeDefined();
				expect(window.test.com_test_inherited).toBeDefined();

				// Clean up
				F2.removeApp(window.test.com_test_basic);
				F2.removeApp(window.test.com_test_inherited);
			});
		});

		it('should load multiple batched apps on same domain', function() {
			F2.load({
				appConfigs: [
					{
						appId: 'com_test_basic',
						manifestUrl: 'http://localhost:8080/apps/multiple',
						enableBatchRequests: true
					},
					{
						appId: 'com_test_inherited',
						manifestUrl: 'http://localhost:8080/apps/multiple',
						enableBatchRequests: true
					}
				]
			});

			waitsFor(function() {
				// Our test classes will throw some properties on the window
				return window.test.com_test_basic && window.test.com_test_inherited;
			}, DEFAULT_TIMEOUT);

			runs(function() {
				expect(window.test.com_test_basic).toBeDefined();
				expect(window.test.com_test_inherited).toBeDefined();

				// Clean up
				F2.removeApp(window.test.com_test_basic);
				F2.removeApp(window.test.com_test_inherited);
			});
		});

		it('should load duplicate apps on same domain with unique instanceIds', function() {
			F2.load({
				appConfigs: [
					{
						appId: 'com_test_duplicate',
						manifestUrl: 'http://localhost:8080/apps/duplicate',
						enableBatchRequests: true
					},
					{
						appId: 'com_test_duplicate',
						manifestUrl: 'http://localhost:8080/apps/duplicate',
						enableBatchRequests: true
					}
				]
			});

			waitsFor(function() {
				// Our test classes will throw some properties on the window
				return window.test.com_test_duplicate && window.test.com_test_duplicate.length === 2;
			}, DEFAULT_TIMEOUT);

			runs(function() {
				var id1 = window.test.com_test_duplicate[0].instanceId;
				var id2 = window.test.com_test_duplicate[1].instanceId;

				expect(id1 !== id2).toBe(true);

				// Clean up
				F2.removeApp(id1);
				F2.removeApp(id2);
			});
		});

		it('should load a single app on an external domain', function() {
			F2.load({
				appConfigs: [{
					appId: 'com_test_basic',
					manifestUrl: 'http://127.0.0.1:8080/apps/single_jsonp'
				}]
			});

			waitsFor(function() {
				// Our test classes will throw some properties on the window
				return window.test.com_test_basic;
			}, DEFAULT_TIMEOUT);

			runs(function() {
				expect(window.test.com_test_basic).toBeDefined();

				// Clean up
				F2.removeApp(window.test.com_test_basic);
			});
		});

		it('should load multiple apps on different domains', function() {
			F2.load({
				appConfigs: [
					{ appId: 'com_test_inherited', manifestUrl: 'http://localhost:8080/apps/single' },
					{ appId: 'com_test_basic', manifestUrl: 'http://127.0.0.1:8080/apps/single_jsonp' }
				]
			});

			waitsFor(function() {
				// Our test classes will throw some properties on the window
				return window.test.com_test_basic && window.test.com_test_inherited;
			}, DEFAULT_TIMEOUT);

			runs(function() {
				var id1 = window.test.com_test_basic.instanceId;
				var id2 = window.test.com_test_inherited.instanceId;

				expect(id1).toBeDefined();
				expect(id2).toBeDefined();
				expect(id1 !== id2).toBe(true);

				// Clean up
				F2.removeApp(id1);
				F2.removeApp(id2);
			});
		});

		it('should allow requests to be aborted on same domain', function() {
			var isComplete = false;

			var reqs = F2.load({
				appConfigs: [{
					appId: 'com_test_basic',
					manifestUrl: 'http://localhost:8080/apps/slow'
				}],
				afterRequest: function() {
					isComplete = true;
				}
			});

			// Abort everything!
			reqs.abort();

			waitsFor(function() {
				// Our test classes will throw some properties on the window
				return isComplete;
			}, DEFAULT_TIMEOUT);

			runs(function() {
				expect(window.test.com_test_basic).not.toBeDefined();
			});
		});

		it('should allow requests to be aborted on different domains', function() {
			var isComplete = false;

			var reqs = F2.load({
				appConfigs: [{
					appId: 'com_test_basic',
					manifestUrl: 'http://127.0.0.1:8080/apps/single_jsonp_slow'
				}],
				afterRequest: function() {
					isComplete = true;
				}
			});

			// Abort everything!
			reqs.abort();

			waitsFor(function() {
				// Our test classes will throw some properties on the window
				return isComplete;
			}, DEFAULT_TIMEOUT);

			runs(function() {
				expect(window.test.com_test_basic).not.toBeDefined();
			});
		});

	});

	describe('removeApp', function() {

		// Shortcut func
		function loadApp(cb) {
			var isComplete = false;

			F2.load({
				appConfigs: [{
					appId: 'com_test_basic',
					manifestUrl: 'http://localhost:8080/apps/single'
				}],
				complete: function() {
					isComplete = true;
				}
			});

			waitsFor(function() {
				return isComplete;
			}, DEFAULT_TIMEOUT);

			runs(function() {
				cb();
			});
		}

		it('should call the app\'s dispose() method', function() {
			loadApp(function() {
				F2.removeApp(window.test.com_test_basic.instanceId);
				expect(window.test.com_test_basic).not.toBeDefined();
			});
		});

		it('should remove by instanceId', function() {
			loadApp(function() {
				F2.removeApp(window.test.com_test_basic.instanceId);
				expect(window.test.com_test_basic).not.toBeDefined();
			});
		});

		it('should remove by root', function() {
			loadApp(function() {
				F2.removeApp(window.test.com_test_basic.root);
				expect(window.test.com_test_basic).not.toBeDefined();
			});
		});

		it('should automatically remove an app\'s events (when context was specified)', function() {
			loadApp(function(root) {
				F2.removeApp(window.test.com_test_basic);

				Events.emit('com_test_basic');
				expect(window.test.com_test_basic_event).not.toBeDefined();
			});
		});

		it('should not throw if an instance can\'t be found', function() {
			function attempt() {
				F2.removeApp(123);
			}

			expect(attempt).not.toThrow();
		});

	});

});