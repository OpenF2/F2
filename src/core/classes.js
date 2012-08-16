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
	 	 * the {@link F2.App} object, but later modified by firing an 
	 	 * {@link F2.Constants.Events.APP_HEIGHT_CHANGE} event.
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
		 * will be true if the {@link F2.App} object sets isSecure = true. It will 
		 * also be true if the Container has decided to run Apps in iframes.
		 * @property isSecure
		 * @type bool
	 	 */
	 	isSecure:false,
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
		 * are defined in {@link F2.Constants.Views}. The presence of a view can be checked
		 * via {@link F2.inArray}:
		 * 
		 *     F2.inArray(F2.Constants.Views.SETTINGS, app.views)
		 *
		 * The {@link F2.Constants.Views}.HOME view should always be present.
		 * @property views
		 * @type Array
	 	 */
	 	views:[]
	},
	/**
	 * The assets needed to render an App on the page
	 * @class F2.AppAssets
	 * @property {Array} Scripts Urls to javascript files required by the App
	 * @property {Array} Styles Urls to CSS files required by the App
	 * @property {Array} InlineScripts Any inline javascript tha should initially be run
	 * @property {string} Html The html of the App
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
		 * The html of the App
		 * @property Html
		 * @type string
		 * @required
		 */
		Html:""
	},
	/**
	 * An object containing configuration information for the Container
	 * @class F2.ContainerConfiguration
	 */
	ContainerConfiguration:{
		/**
		 * Allows the Container to wrap an App in extra html. The
		 * function should accept an {@link F2.App} object and also a string of html.
		 * The extra html can provide links to edit app settings and remove an app from the
		 * Container. See {@link F2.Constants.Css} for CSS classes that should be applied to elements.
		 * @property appWrapper
		 * @type function
		 */
		appWrapper:function() {},
		/**
		 * Allows the Container to override how an App's html is 
		 * inserted into the page. The function should accept an {@link F2.App} object
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
		 * header. The {@link F2.Constants.Views}.HOME view should always be present.
		 * @property supportedViews
		 * @type Array
		 * @required
		 */
		supportedViews:[]
	}
});