describe('F2.loadPlaceholders - auto', function () {
	var itShouldFindAndRegisterApps = function (selector, count) {
		it('should automatically find and register apps', function (done) {
			var children = 0;
			var periodicCheck = setInterval(function () {
				var element = document.querySelectorAll(selector);
				if (!element) {
					return;
					// clearInterval(periodicCheck);
					// console.log('unable to locate selector: ' + selector);
					// throw new Error('unable to locate selector: ' + selector);
				}
				// sum the number of children found in each of the elements that were found
				children = Array.from(element).reduce(
					(total, current) => total + current.children.length,
					0
				);
				if (children === count) {
					try {
						expect(children).toEqual(count);
					} catch (e) {
						console.error(
							'caught exception waiting for children: ' + e.message
						);
					} finally {
						clearInterval(periodicCheck);
					}
					done();
				}
			}, 100);
		});
	};

	describe('single app by id', function () {
		// append test to DOM before reloading F2
		beforeEach(function () {
			document.getElementById('test-fixture').innerHTML +=
				'<div id="f2-autoload" data-f2-appid="' +
				TEST_APP_ID +
				'" data-f2-manifesturl="' +
				TEST_MANIFEST_URL +
				'"></div>';
		});

		// force F2 to be reloaded
		beforeEachReloadF2();

		it('should automatically auto-init F2 when f2-autoload id is on the page', function () {
			// need to wait for dom ready before F2.init() will be called
			expect(F2.isInit()).toBe(true);
		});

		itShouldFindAndRegisterApps('#f2-autoload', 1);
	});

	describe('single app by id, with children', function () {
		// append test to DOM before reloading F2
		beforeEach(function () {
			document.getElementById('test-fixture').innerHTML += [
				'<div id="f2-autoload" data-f2-appid="' +
					TEST_APP_ID +
					'" data-f2-manifesturl="' +
					TEST_MANIFEST_URL +
					'">',
				'<div data-f2-appid="' +
					TEST_APP_ID2 +
					'" data-f2-manifesturl="' +
					TEST_MANIFEST_URL2 +
					'"></div>',
				'</div>'
			].join('');
		});

		// force F2 to be reloaded
		beforeEachReloadF2();

		itShouldFindAndRegisterApps('#f2-autoload', 1);

		it('should ignore apps within apps', function (done) {
			setTimeout(function () {
				expect(document.getElementById('f2-autoload').children.length).toEqual(
					1
				);
				expect(
					Array.from(
						document.querySelectorAll('#f2-autoload [data-f2-appid]')
					).reduce((total, current) => total + current.children.length, 0)
				).toEqual(0);
				done();
			}, 3000); // arbitrary amount of time
		});
	});

	describe('single app by attribute', function () {
		// append test to DOM before reloading F2
		beforeEach(function () {
			document.getElementById('test-fixture').innerHTML +=
				'<div data-f2-autoload data-f2-appid="' +
				TEST_APP_ID +
				'" data-f2-manifesturl="' +
				TEST_MANIFEST_URL +
				'"></div>';
		});

		// force F2 to be reloaded
		beforeEachReloadF2();

		it('should automatically auto-init F2 when data-f2-autoload attribute is on the page', function () {
			expect(F2.isInit()).toBe(true);
		});

		itShouldFindAndRegisterApps('[data-f2-autoload]', 1);
	});

	describe('single app by class', function () {
		// append test to DOM before reloading F2
		beforeEach(function () {
			document.getElementById('test-fixture').innerHTML +=
				'<div class="f2-autoload" data-f2-appid="' +
				TEST_APP_ID +
				'" data-f2-manifesturl="' +
				TEST_MANIFEST_URL +
				'"></div>';
		});

		// force F2 to be reloaded
		beforeEachReloadF2();

		it('should automatically auto-init F2 when f2-autoload class is on the page', function () {
			expect(F2.isInit()).toBe(true);
		});

		itShouldFindAndRegisterApps('.f2-autoload', 1);
	});

	describe('single app by id, nested', function () {
		// append test to DOM before reloading F2
		beforeEach(function () {
			document.getElementById('test-fixture').innerHTML += [
				'<div id="f2-autoload">',
				'<div data-f2-appid="' +
					TEST_APP_ID +
					'" data-f2-manifesturl="' +
					TEST_MANIFEST_URL +
					'"></div>',
				'</div>'
			].join('');
		});

		// force F2 to be reloaded
		beforeEachReloadF2();

		itShouldFindAndRegisterApps('#f2-autoload [data-f2-appid]', 1);
	});

	describe('single app by attribute, nested', function () {
		// append test to DOM before reloading F2
		beforeEach(function () {
			document.getElementById('test-fixture').innerHTML += [
				'<div id="f2-autoload-single" data-f2-autoload>',
				'<div data-f2-appid="' +
					TEST_APP_ID +
					'" data-f2-manifesturl="' +
					TEST_MANIFEST_URL +
					'"></div>',
				'</div>'
			].join('');
		});

		// force F2 to be reloaded
		beforeEachReloadF2();

		itShouldFindAndRegisterApps('#f2-autoload-single [data-f2-appid]', 1);
	});

	describe('single app by class, nested', function () {
		// append test to DOM before reloading F2
		beforeEach(function () {
			document.getElementById('test-fixture').innerHTML += [
				'<div id="f2-autoload-single" class="f2-autoload">',
				'<div data-f2-appid="' +
					TEST_APP_ID +
					'" data-f2-manifesturl="' +
					TEST_MANIFEST_URL +
					'"></div>',
				'</div>'
			].join('');
		});

		// force F2 to be reloaded
		beforeEachReloadF2();

		itShouldFindAndRegisterApps('#f2-autoload-single [data-f2-appid]', 1);
	});

	describe('many apps by id', function () {
		// append test to DOM before reloading F2
		beforeEach(function () {
			document.getElementById('test-fixture').innerHTML += [
				'<div id="f2-autoload">',
				'<div data-f2-appid="' +
					TEST_APP_ID +
					'" data-f2-manifesturl="' +
					TEST_MANIFEST_URL +
					'"></div>',
				'<div data-f2-appid="' +
					TEST_APP_ID2 +
					'" data-f2-manifesturl="' +
					TEST_MANIFEST_URL2 +
					'"></div>',
				'</div>'
			].join('');
		});

		// force F2 to be reloaded
		beforeEachReloadF2();

		itShouldFindAndRegisterApps('#f2-autoload [data-f2-appid]', 2);
	});

	describe('many apps by attribute', function () {
		// append test to DOM before reloading F2
		beforeEach(function () {
			document.getElementById('test-fixture').innerHTML += [
				'<div id="f2-autoload-many" data-f2-autoload>',
				'<div data-f2-appid="' +
					TEST_APP_ID +
					'" data-f2-manifesturl="' +
					TEST_MANIFEST_URL +
					'"></div>',
				'<div data-f2-appid="' +
					TEST_APP_ID2 +
					'" data-f2-manifesturl="' +
					TEST_MANIFEST_URL2 +
					'"></div>',
				'</div>'
			].join('');
		});

		// force F2 to be reloaded
		beforeEachReloadF2();

		itShouldFindAndRegisterApps('#f2-autoload-many [data-f2-appid]', 2);
	});

	describe('many apps by class', function () {
		// append test to DOM before reloading F2
		beforeEach(function () {
			document.getElementById('test-fixture').innerHTML += [
				'<div id="f2-autoload-many" class="f2-autoload">',
				'<div data-f2-appid="' +
					TEST_APP_ID +
					'" data-f2-manifesturl="' +
					TEST_MANIFEST_URL +
					'"></div>',
				'<div data-f2-appid="' +
					TEST_APP_ID2 +
					'" data-f2-manifesturl="' +
					TEST_MANIFEST_URL2 +
					'"></div>',
				'</div>'
			].join('');
		});

		// force F2 to be reloaded
		beforeEachReloadF2();

		itShouldFindAndRegisterApps('#f2-autoload-many [data-f2-appid]', 2);
	});

	describe('many placeholders by attribute', function () {
		// append test to DOM before reloading F2
		beforeEach(function () {
			document.getElementById('test-fixture').innerHTML += [
				'<div data-f2-autoload>',
				'<div data-f2-appid="' +
					TEST_APP_ID +
					'" data-f2-manifesturl="' +
					TEST_MANIFEST_URL +
					'"></div>',
				'</div>',
				'<div data-f2-autoload>',
				'<div data-f2-appid="' +
					TEST_APP_ID2 +
					'" data-f2-manifesturl="' +
					TEST_MANIFEST_URL2 +
					'"></div>',
				'</div>'
			].join('');
		});

		// force F2 to be reloaded
		beforeEachReloadF2();

		itShouldFindAndRegisterApps('#test-fixture [data-f2-appid]', 2);
	});

	describe('many placeholders by class', function () {
		// append test to DOM before reloading F2
		beforeEach(function () {
			document.getElementById('test-fixture').innerHTML += [
				'<div class="f2-autoload">',
				'<div data-f2-appid="' +
					TEST_APP_ID +
					'" data-f2-manifesturl="' +
					TEST_MANIFEST_URL +
					'"></div>',
				'</div>',
				'<div class="f2-autoload">',
				'<div data-f2-appid="' +
					TEST_APP_ID2 +
					'" data-f2-manifesturl="' +
					TEST_MANIFEST_URL2 +
					'"></div>',
				'</div>'
			].join('');
		});

		// force F2 to be reloaded
		beforeEachReloadF2();

		itShouldFindAndRegisterApps('#test-fixture [data-f2-appid]', 2);
	});
});

describe('F2.loadPlaceholders - manual', function () {
	// force F2 to be reloaded
	beforeEachReloadF2(function () {
		document.getElementById('test-fixture').innerHTML +=
			'<div id="f2-autoload"></div>';

		spyOn(console, 'log').and.callThrough();
	});

	var shouldFindAndRegisterApps = function (selector, count, done) {
		var children = 0;
		var periodicCheck = setInterval(function () {
			var element = document.querySelectorAll(selector);
			if (!element) {
				clearInterval(periodicCheck);
				throw new Error('unable to locate selector: ' + selector);
			}
			// sum the number of children found in each of the elements that were found
			children = Array.from(element).reduce(
				(total, current) => total + current.children.length,
				0
			);
			if (children === count) {
				try {
					expect(children).toEqual(count);
				} catch (e) {
					console.error('caught exception waiting for children: ' + e.message);
				} finally {
					clearInterval(periodicCheck);
				}
				done();
			}
		}, 100);
	};

	it('should require the presence of data-f2-manifesturl', function () {
		// add the invalid placeholder
		document.getElementById('f2-autoload').innerHTML +=
			'<div data-f2-appid="' + TEST_APP_ID + '"></div>';

		// even though the manifesturl is missing, the message is generic because a
		// null AppConfig was generated
		F2.init();
		F2.loadPlaceholders();

		expect(console.log).toHaveBeenCalledWith('"appId" missing from app object');
	});

	it('should find and register apps', function (done) {
		document.getElementById('test-fixture').innerHTML += [
			'<div id="f2-autoload">',
			'<div data-f2-appid="' +
				TEST_APP_ID +
				'" data-f2-manifesturl="' +
				TEST_MANIFEST_URL +
				'"></div>',
			'</div>'
		].join('');

		F2.init();
		F2.loadPlaceholders();

		shouldFindAndRegisterApps('#f2-autoload [data-f2-appid]', 1, done);
	});

	it('should find and register multiple apps', function (done) {
		// add the placeholder
		document.getElementById('test-fixture').innerHTML += [
			'<div id="f2-autoload">',
			'<div data-f2-appid="' +
				TEST_APP_ID +
				'" data-f2-manifesturl="' +
				TEST_MANIFEST_URL +
				'"></div>',
			'<div data-f2-appid="' +
				TEST_APP_ID2 +
				'" data-f2-manifesturl="' +
				TEST_MANIFEST_URL2 +
				'"></div>',
			'</div>'
		].join('');

		F2.init();
		F2.loadPlaceholders();

		shouldFindAndRegisterApps('#f2-autoload [data-f2-appid]', 2, done);
	});

	it('should throw an exception when an invalid parentNode is passed', function () {
		expect(function () {
			F2.init();
			F2.loadPlaceholders('foo');
		}).toThrow('"parentNode" must be null or a DOM node');
	});

	it('should find and register apps within a given scope', function (done) {
		// add the placeholder
		document.getElementById('test-fixture').innerHTML += [
			'<div id="f2-autoload">',
			'<div data-f2-appid="' +
				TEST_APP_ID +
				'" data-f2-manifesturl="' +
				TEST_MANIFEST_URL +
				'"></div>',
			'</div>'
		].join('');

		F2.init();
		F2.loadPlaceholders(document.getElementById('test-fixture'));

		shouldFindAndRegisterApps('#f2-autoload [data-f2-appid]', 1, done);
	});
});
