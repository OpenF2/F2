/**
 * Class stubs for documentation purposes
 * @main F2
 */
F2.extend("", {
	/**
	 * The App object represents an App's meta data
	 * @class F2.App
	 */
	 App:{
	 	/**
	 	 * The unique ID of the App
	 	 * @property appId
	 	 * @type string
	 	 * @required
	 	 */
	 	appId:"",
	 	/**
	 	 * The description of the App
	 	 * @property description
	 	 * @type string
	 	 * @required
	 	 */
	 	description:"",
		/**
		 * The company of the developer
		 * @property developerCompany
		 * @type string
		 * @required
		 */
	 	developerCompany:"",
	 	/**
	 	 * The name of the developer
	   * @property developerName
	   * @type string
		 * @required
	 	 */
	 	developerName:"",
	 	/**
	 	 * The url of the developer
	 	 * @property developerUrl
	 	 * @type string
	 	 * @required
	 	 */
	 	developerUrl:"",
	 	/**
	 	 * The height of the App. The initial height will be pulled from
	 	 * the {{#crossLink "F2.App"}}{{/crossLink}} object, but later modified by firing an 
	 	 * {{#crossLink "F2.Constants.Events"}}{{/crossLink}}.APP_HEIGHT_CHANGE event.
	 	 * @property height
	 	 * @type int
	 	 */
	 	height:0,
	 	/**
	 	 * The unique runtime ID of the App
	 	 * @property instanceId
	 	 * @type string
	 	 */
	 	instanceId:"",
	 	/**
	 	 * True if the App will be loaded in an iframe. This property
		 * will be true if the {{#crossLink "F2.App"}}{{/crossLink}} object sets isSecure = true. It will 
		 * also be true if the Container has decided to run Apps in iframes.
		 * @property isSecure
		 * @type bool
		 * @default false
	 	 */
	 	isSecure:false,
	 	/**
	 	 * The recommended maximum width in pixels that this app should be run.
	 	 * It is up to the Container to implement the logic to prevent an App
	 	 * from being run when the maxWidth requirements are not met.
	 	 * @property maxWidth
	 	 * @type int
	 	 */
	 	maxWidth:0,
	 	/**
	 	 * The recommended minimum grid size that this app should be run. This
	 	 * value corresponds to the 12-grid system that is used by the Container.
	 	 * This property should be set by Apps that require a certain number of 
	 	 * columns in their layout.
	 	 * @property minGridSize
	 	 * @type int
	 	 * @default 4
	 	 */
	 	minGridSize:4,
	 	/**
	 	 * The recommended minimum width in pixels that this app should be 
	 	 * run. It is up to the Container to implement the logic to prevent
	 	 * an App from being run when the minWidth requirements are not met.
	 	 * @property minWidth
	 	 * @type int
	 	 * @default 300
	 	 */
	 	minWidth:300,
	 	/**
	 	 * The name of the App
	 	 * @property name
	 	 * @type string
	 	 * @required
	 	 */
	 	name:"",
	 	/**
	 	 * The url of the App
	 	 * @property url
	 	 * @type string
	 	 * @required
	 	 */
	 	url:"",
	 	/**
	 	 * The views that this App supports. Available views
		 * are defined in {{#crossLink "F2.Constants.Views"}}{{/crossLink}}. The presence of a view can be checked
		 * via F2.{{#crossLink "F2/inArray"}}{{/crossLink}}:
		 * 
		 *     F2.inArray(F2.Constants.Views.SETTINGS, app.views)
		 *
		 * The {{#crossLink "F2.Constants.Views"}}{{/crossLink}}.HOME view should always be present.
		 * @property views
		 * @type Array
	 	 */
	 	views:[]
	},
	/**
	 * The assets needed to render an App on the page
	 * @class F2.AppAssets
	 */
	AppAssets:{
		/**
		 * Urls to javascript files required by the App
		 * @property Scripts
		 * @type Array
		 */
		Scripts:[],
		/**
		 * Urls to CSS files required by the App
		 * @property Styles
		 * @type Array
		 */
		Styles:[],
		/**
		 * Any inline javascript tha should initially be run
		 * @property InlineScripts
		 * @type Array
		 */
		InlineScripts:[],
		/**
		 * The array of {{#crossLink "F2.AppAssets.AppContent"}}{{/crossLink}} objects
		 * @property Apps
		 * @type Array
		 * @required
		 */
		Apps:[]
	},
	/**
	 * The AppContent object
	 * @class F2.AppAssets.AppContent
	 **/
	AppContent:{
		/**
		 * Arbitrary data to be passed along with the App
		 * @property data
		 * @type object
		 */
		data:{},
		/**
		 * The string of HTML representing the App
		 * @property html
		 * @type string
		 * @required
		 */
		html:"",
		/**
	 	 * The unique runtime ID of the App
	 	 * @property instanceId
	 	 * @type string
	 	 * @required
	 	 */
	 	instanceId:"",
		/**
		 * A status message
		 * @property status
		 * @type string
		 */
		status:""
	},
	/**
	 * An object containing configuration information for the Container
	 * @class F2.ContainerConfiguration
	 */
	ContainerConfiguration:{
		/**
		 * Allows the Container to wrap an App in extra html. The
		 * function should accept an {{#crossLink "F2.App"}}{{/crossLink}} object and also a string of html.
		 * The extra html can provide links to edit app settings and remove an app from the
		 * Container. See {{#crossLink "F2.Constants.Css"}}{{/crossLink}} for CSS classes that should be applied to elements.
		 * @property appWrapper
		 * @type function
		 */
		appWrapper:function() {},
		/**
		 * Allows the Container to override how an App's html is 
		 * inserted into the page. The function should accept an {{#crossLink "F2.App"}}{{/crossLink}} object
		 * and also a string of html
		 * @property appWriter
		 * @type function
		 */
		appWriter:function() {},
		/**
		 * Tells the Container that it is currently running within
		 * a secure app page
		 * @property isSecureAppPage
		 * @type bool
		 */
		isSecureAppPage:false,
		/**
		 * Allows the Container to specify which page is used when
		 * loading a secure app. The page must reside on a different domain than the Container
		 * @property secureAppPagePath
		 * @type string
		 */
		secureAppPagePath:"",
		/**
		 * Specifies what views a Container will provide buttons
		 * or liks to. Generally, the views will be switched via buttons or links in the App's
		 * header. The {{#crossLink "F2.Constants.Views"}}{{/crossLink}}.HOME view should always be present.
		 * @property supportedViews
		 * @type Array
		 * @required
		 */
		supportedViews:[]
	}
});