/**
  Constants for use with cross-domain sockets.
  @class F2.Constants.Sockets
  @protected
*/
module.exports = {
  /**
    The EVENT message is sent whenever
    F2.Events.{{#crossLink "F2.Events/emit"}}{{/crossLink}} is fired.
    @property EVENT
    @type string
    @static
    @final
  */
  EVENT: '__event__',
  /**
    The LOAD message is sent when an iframe socket initially loads. Returns
    a JSON string that represents: `[ App, AppManifest]`
    @property LOAD
    @type string
    @static
    @final
  */
  LOAD: '__socketLoad__',
  /**
    The RPC message is sent when a method is passed up from within a secure
    app page.
    @property RPC
    @type string
    @static
    @final
  */
  RPC: '__rpc__',
  /**
    The RPC\_CALLBACK message is sent when a call back from an RPC method is
    fired.
    @property RPC_CALLBACK
    @type string
    @static
    @final
  */
  RPC_CALLBACK: '__rpcCallback__',
  /**
    The UI\_RPC message is sent when a UI method called.
    @property UI_RPC
    @type string
    @static
    @final
  */
  UI_RPC: '__uiRpc__'
};
