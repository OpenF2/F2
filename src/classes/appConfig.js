/**
 * The AppConfig object represents an app's meta data
 * @class F2.AppConfig
 */
export default {
	/**
	 * The unique ID of the app. More information can be found
	 * [here](../../app-development.html#f2-appid)
	 * @property appId
	 * @type string
	 * @required
	 */
	appId: '',
	/**
	 * An object that represents the context of an app
	 * @property context
	 * @type object
	 */
	context: {},
	/**
	 * True if the app should be requested in a single request with other apps.
	 * @property enableBatchRequests
	 * @type bool
	 * @default false
	 */
	enableBatchRequests: false,
	/**
	 * The height of the app. The initial height will be pulled from
	 * the {{#crossLink "F2.AppConfig"}}{{/crossLink}} object
	 * @property height
	 * @type int
	 */
	height: 0,
	/**
	 * The unique runtime ID of the app.
	 *
	 * **This property is populated during the
	 * F2.{{#crossLink "F2/registerApps"}}{{/crossLink}} process**
	 * @property instanceId
	 * @type string
	 */
	instanceId: '',
	/**
	 * The language and region specification for this container
	 * represented as an IETF-defined standard language tag,
	 * e.g. `"en-us"` or `"de-de"`. This is passed during the
	 * F2.{{#crossLink "F2/registerApps"}}{{/crossLink}} process.
	 *
	 * @property containerLocale
	 * @type string
	 * @default null
	 * @since 1.4.0
	 */
	containerLocale: null,
	/**
	 * The languages and regions supported by this app represented
	 * as an array of IETF-defined standard language tags,
	 * e.g. `["en-us","de-de"]`.
	 *
	 * @property localeSupport
	 * @type array
	 * @default []
	 * @since 1.4.0
	 */
	localeSupport: [],
	/**
	 * The url to retrieve the {{#crossLink "F2.AppManifest"}}{{/crossLink}}
	 * object.
	 * @property manifestUrl
	 * @type string
	 * @required
	 */
	manifestUrl: '',
	/**
	 * The recommended maximum width in pixels that this app should be run.
	 * **It is up to the [container](../../container-development.html) to
	 * implement the logic to prevent an app from being run when the maxWidth
	 * requirements are not met.**
	 * @property maxWidth
	 * @type int
	 */
	maxWidth: 0,
	/**
	 * The recommended minimum grid size that this app should be run. This
	 * value corresponds to the 12-grid system that is used by the
	 * [container](../../container-development.html). This property should be
	 * set by apps that require a certain number of columns in their layout.
	 * @property minGridSize
	 * @type int
	 * @default 4
	 */
	minGridSize: 4,
	/**
	 * The recommended minimum width in pixels that this app should be run. **It
	 * is up to the [container](../../container-development.html) to implement
	 * the logic to prevent an app from being run when the minWidth requirements
	 * are not met.
	 * @property minWidth
	 * @type int
	 * @default 300
	 */
	minWidth: 300,
	/**
	 * The name of the app
	 * @property name
	 * @type string
	 * @required
	 */
	name: '',
	/**
	 * The root DOM element that contains the app
	 *
	 * **This property is populated during the
	 * F2.{{#crossLink "F2/registerApps"}}{{/crossLink}} process**
	 * @property root
	 * @type Element
	 */
	root: undefined
};
