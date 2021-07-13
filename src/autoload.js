import container from './container';

export default function() {

	var callback = function() {
		var autoloadEls = [],
			add = function(e) {
				if (!e) { return; }
				autoloadEls.push(e);
			},
			addAll = function(els) {
				if (!els) { return; }
				for (var i = 0, len = els.length; i < len; i++) {
					add(els[i]);
				}
			};

		// support id-based autoload
		add(document.getElementById('f2-autoload'));

		// support class/attribute based autoload
		if (document.querySelectorAll) {
			addAll(document.querySelectorAll('[data-f2-autoload]'));
			addAll(document.querySelectorAll('.f2-autoload'));
		}

		// if elements were found, auto-init F2 and load any placeholders
		if (autoloadEls.length) {
			container.init();
			for (var i = 0, len = autoloadEls.length; i < len; i++) {
				container.loadPlaceholders(autoloadEls[i]);
			}
		}
	};

	if (document.readyState === 'complete' || (document.readyState !== 'loading' && !document.documentElement.doScroll)) {
		callback();
	} else {
		document.addEventListener('DOMContentLoaded', callback);
	}
}