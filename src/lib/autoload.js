/* global jQuery */

var container = require('./container');

var autoloadEls = [];

function add(e) {
  if (!e) {
    return;
  }

  autoloadEls.push(e);
}

function addAll(els) {
  if (!els) {
    return;
  }

  for (var i = 0, len = els.length; i < len; i++) {
    add(els[i]);
  }
}

// Autoload placeholders
jQuery(function() {
  // Support id-based autoload
  add(document.getElementById('f2-autoload'));

  // Support class/attribute based autoload
  if (document.querySelectorAll) {
    addAll(document.querySelectorAll('[data-f2-autoload]'));
    addAll(document.querySelectorAll('.f2-autoload'));
  }

  // If elements were found, auto-init F2 and load any placeholders
  if (autoloadEls.length) {
    container.init();

    for (var i = 0, len = autoloadEls.length; i < len; i++) {
      container.loadPlaceholders(autoloadEls[i]);
    }
  }
});
