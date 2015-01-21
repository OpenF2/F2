var container = require('./container');
var jQuery = require('jquery');

var autoloadEls = [];

function add(els) {
  if (!els || !els.length) {
    return;
  }

  for (var i = 0, len = els.length; i < len; i++) {
    if (els[i]) {
      autoloadEls.push(els[i]);
    }
  }
}

// Autoload placeholders
jQuery(function() {
  // Support id-based autoload
  add([document.getElementById('f2-autoload')]);

  // Support class/attribute based autoload
  if (document.querySelectorAll) {
    add(document.querySelectorAll('[data-f2-autoload]'));
    add(document.querySelectorAll('.f2-autoload'));
  }

  // If elements were found, auto-init F2 and load any placeholders
  if (autoloadEls.length) {
    container.init();

    for (var i = 0, len = autoloadEls.length; i < len; i++) {
      container.loadPlaceholders(autoloadEls[i]);
    }
  }
});
