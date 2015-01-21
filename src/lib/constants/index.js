var appHandlers = require('./appHandlers');
var css = require('./css');
var events = require('./events');
var sockets = require('./sockets');
var views = require('./views');

module.exports = {
  AppHandlers: appHandlers,
  Css: css,
  Events: events,
  JSONP_CALLBACK: 'F2_jsonpCallback_',
  Sockets: sockets,
  Views: views
};
