var appHandlers = require('./app_handlers');
var classes = require('./classes');
var constants = require('./constants');
var container = require('./container');
var events = require('./events');
var f2 = require('./F2');
var rpc = require('./rpc');
var ui = require('./ui');

require('./autoload');

module.exports = window.F2 = {
  appConfigReplacer: f2.appConfigReplacer,
  AppHandlers: appHandlers,
  App: classes.App,
  AppConfig: classes.AppConfig,
  AppContent: classes.AppContent,
  AppManifest: classes.AppManifest,
  Apps: f2.Apps,
  Constants: constants,
  ContainerConfig: classes.ContainerConfig,
  Events: events,
  extend: f2.extend,
  getContainerLocale: container.getContainerLocale,
  getContainerState: container.getContainerState,
  guid: f2.guid,
  inArray: f2.inArray,
  init: container.init,
  isInit: container.isInit,
  isLocalRequest: f2.isLocalRequest,
  isNativeDOMNode: f2.isNativeDOMNode,
  log: f2.log,
  loadPlaceholders: container.loadPlaceholders,
  parse: f2.parse,
  registerApps: container.registerApps,
  removeAllApps: container.removeAllApps,
  removeApp: container.removeApp,
  Rpc: rpc,
  stringify: f2.stringify,
  UI: ui,
  version: f2.version
};
