/**
  The AppConfig object represents an app's meta data
  @class F2.AppConfig
*/
module.exports = {
  /**
    The unique ID of the app. More information can be found
    [here](../../app-development.html#f2-appid).
    @property appId
    @type string
    @required
  */
  appId: '',
  /**
    An object that represents the context of an app.
    @property context
    @type object
  */
  context: {},
  /**
    True if the app should be requested in a single request with other apps.
    @property enableBatchRequests
    @type bool
    @default false
  */
  enableBatchRequests: false,
  /**
    The height of the app. The initial height will be pulled from the
    {{#crossLink "F2.AppConfig"}}{{/crossLink}} object, but later modified by
    calling F2.UI.{{#crossLink "F2.UI/updateHeight"}}{{/crossLink}}. This is
    used for secure apps to be able to set the initial height of the iframe.
    @property height
    @type int
  */
  height: 0,
  /**
    The unique runtime ID of the app.
    **This property is populated during the
    F2.{{#crossLink "F2/registerApps"}}{{/crossLink}} process**
    @property instanceId
    @type string
  */
  instanceId: '',
  /**
    True if the app will be loaded in an iframe. This property will be true
    if the {{#crossLink "F2.AppConfig"}}{{/crossLink}} object sets
    `isSecure = true`. It will also be true if the
    [container](../../container-development.html) has made the decision to
    run apps in iframes.
    @property isSecure
    @type bool
    @default false
  */
  isSecure: false,
  /**
    The language and region specification for this container represented as
    an IETF-defined standard language tag, e.g. `"en-us"` or `"de-de"`. This
    is passed during the F2.{{#crossLink "F2/registerApps"}}{{/crossLink}}
    process.
    @property containerLocale
    @type string
    @default null
    @since 1.4.0
  */
  containerLocale: null,
  /**
    The languages and regions supported by this app represented as an array
    of IETF-defined standard language tags, e.g. `["en-us","de-de"]`.
    @property localeSupport
    @type array
    @default []
    @since 1.4.0
  */
  localeSupport: [],
  /**
    The url to retrieve the {{#crossLink "F2.AppManifest"}}{{/crossLink}}
    object.
    @property manifestUrl
    @type string
    @required
  */
  manifestUrl: '',
  /**
    The recommended maximum width in pixels that this app should be run. **It
    is up to the [container](../../container-development.html) to implement
    the logic to prevent an app from being run when the maxWidth requirements
    are not met.**
    @property maxWidth
    @type int
  */
  maxWidth: 0,
  /**
    The recommended minimum grid size that this app should be run. This value
    corresponds to the 12-grid system that is used by the
    [container](../../container-development.html). This property should be
    set by apps that require a certain number of columns in their layout.
    @property minGridSize
    @type int
    @default 4
  */
  minGridSize: 4,
  /**
    The recommended minimum width in pixels that this app should be run.
    **It is up to the [container](../../container-development.html) to
    implement the logic to prevent an app from being run when the minWidth
    requirements are not met.
    @property minWidth
    @type int
    @default 300
  */
  minWidth: 300,
  /**
    The name of the app.
    @property name
    @type string
    @required
  */
  name: '',
  /**
    The root DOM element that contains the app.
    **This property is populated during the
    F2.{{#crossLink "F2/registerApps"}}{{/crossLink}} process.**
    @property root
    @type Element
  */
  root: undefined,
  /**
    The instance of F2.UI providing easy access to F2.UI methods.
    **This property is populated during the
    F2.{{#crossLink "F2/registerApps"}}{{/crossLink}} process.**
    @property ui
    @type F2.UI
  */
  ui: undefined,
  /**
    The views that this app supports. Available views are defined in
    {{#crossLink "F2.Constants.Views"}}{{/crossLink}}. The presence of a view
    can be checked via F2.{{#crossLink "F2/inArray"}}{{/crossLink}}:
    F2.inArray(F2.Constants.Views.SETTINGS, app.views).
    @property views
    @type Array
  */
  views: []
};
