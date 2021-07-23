# App Development

<p class="lead">
Apps are the building blocks of any F2-enabled solution. F2 apps are web-based, built with HTML5, CSS3, and JavaScript, and contain entitled data. F2 enables App Developers to build once and deploy to any [container](container-development.html) with a simple and modern API. You can [download the project on GitHub](https://github.com/OpenF2/F2#quick-start) or [get started](#get-started) below.
</p>

F2 apps are synonymous with modules, widgets and portlets. Think charts, portfolios, trade tickets, and screeners. F2 apps only need to be programmed once, no matter where they will be used. To start, F2 Apps are either:

<dl class="dl-horizontal">
	<dt>Display App</dt>
	<dd>A display app presents information to users in the form of a visible widget (using HTML, CSS, and JavaScript).</dd>
	<dt>Data App</dt>
	<dd>A data app is a content feed available in industry-standard formats including JSON, JSONP, RSS or app developer-designed XML.</dd>
</dl>

For the purposes of the documentation on this page, we'll focus on developing **display apps**. Browse to [The Basics: Framework](about-f2.html#apps) for more background information about F2 apps.

_Interested in developing F2 containers? [Browse to Container Development](container-development.html)._

---

## Get Started

To help you get started building an F2 app, review the documentation and examples below. To jump start your F2 container or app development, download the F2 example container and apps.

<p><a href="http://docs.openf2.org/F2-examples.zip" class="btn btn-primary btn-small">Download F2 Examples</a></p>

### Basic Container

To begin, you **do not** need to build (or compile) F2 [as described in the readme on GitHub](https://github.com/OpenF2/F2#build-f2). Simply download [F2.js](f2js-sdk.html) and [Bootstrap](http://getbootstrap.com/), and ensure you're [properly configured](#configuration) for continuing with the documentation.

<p><a href="https://github.com/OpenF2/F2/releases" class="btn btn-primary btn-small">Download F2.js</a> <a href="http://getbootstrap.com/" class="btn btn-default btn-small">Download Bootstrap</a></p>

Setup a basic container HTML template (or add F2.js to an existing website):

```html
<!DOCTYPE html>
    <head>
        <title>F2 Container</title>
        <link rel="stylesheet" href="/path/to/your/bootstrap.css">
    </head>
    <body>
        <script src="/path/to/your/F2.js"></script>
    </body>
</html>
```

<span class="label label-info">Note</span> In [developing a more advanced container](container-development.html), the HTML document's `body` element would contain additional markup and allow for [specific positioning or placement of apps](container-development.html#apphandlers-for-app-layout). Additionally, more advanced containers could introduce features and functionality to their apps in the form of authentication APIs, streaming data feeds, federated search, etc. All containers must follow the [F2 design guidelines](container-development.html#container-design).

### Basic AppConfig

```javascript
var _appConfig = {
	appId: 'com_openf2_examples_javascript_helloworld',
	manifestUrl:
		'http://docs.openf2.org/demos/apps/JavaScript/HelloWorld/manifest.js'
};

$(function () {
	F2.init();
	F2.registerApps(_appConfig);
});
```

<span class="label label-info">Note</span> For more information about the `AppConfig`, [read up on them](container-development.html#appconfigs) in Container Development: App Integration.

### Testing the Basics

Now with a basic container and a basic app, combine these two for a working example. Press **Result** in this jsfiddle.

<iframe width="100%" height="300" src="http://jsfiddle.net/OpenF2js/RTXg3/embedded/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

In getting to this point, you've only scratched the surface of F2 containers and apps. Continue reading and understanding the F2 spec to build exactly the financial solutions that our customers want.

### Sample Apps and Container

Good news! In the [project repo on GitHub](https://github.com/OpenF2/F2/tree/master/examples/), you will find a basic container along with a number of sample apps which demonstrate functionality far beyond the basic app above. Once you clone or download the project repository, open the sample container by pointing your browser at:

`http://localhost/F2/examples/`

These examples are also available in a separate archive if you don't want to download the entire repository.

<p><a href="http://docs.openf2.org/F2-examples.zip" class="btn btn-primary btn-small">Download F2 Examples</a></p>

### Configuration

It is assumed you will be developing F2 apps locally and have a `localhost` setup. The URLs mentioned in this specification also assume you have configured your F2 apps to run at `http://localhost/F2/`. The examples provided as part of the project repository demonstrate apps written in different languages (PHP, JavaScript, C#). While it is not a requirement you have a web server configured on your computer, it will certainly allow you to more deeply explore the sample apps.

To better understand F2 and the role of apps, you need to understand the role of the container. If you haven’t already, [read more about containers in the Framework](about-f2.html#framework).

To get started working with or developing containers, browse to the [documentation for developing the container](container-development.html).

**Ready to start coding?**

<p><a href="#developing-f2-apps" class="btn btn-primary btn-small">Developing F2 Apps</a> <a href="./sdk/" class="btn btn-default btn-small">F2.js SDK Reference</a></p>

---

## App Design

Design considerations are an important first step when creating a new app. Content can range from news to research to multimedia, and content should be presented using [Progressive Enhancement](http://www.alistapart.com/articles/understandingprogressiveenhancement/), [Mobile First](http://www.lukew.com/presos/preso.asp?26) and [Responsive Design](http://www.abookapart.com/products/responsive-web-design) methodologies. That is to say multimedia content, for example, should be shown plugin-free (using HTML5 video or audio elements) for capable browsers and fallback to Flash-based players for browsers that do not yet support HTML5 related technologies. ([VideoJS](http://videojs.com/) is good example of open-source JavaScript and CSS "that makes it easier to work with and build on HTML5 video, today.")

If App Developers embed URLs back to their own websites or to third party sites, URLs must be opened in a new window as to not interrupt the experience of someone using the container. If authentication is required on an App Developer's site, this can be accomplished with pass-through authentication using encrypted URLs as discussed in [Single Sign On](#single-sign-on).

### Choices

In order to ensure that apps built using F2 are successful, they must be accessible. As such, F2 made choices for which open-source libraries and frameworks would be leveraged to reduce the level of effort across F2 adopters.

[Read more about those choices in the Framework](about-f2.html#choices).

Ultimately, the responsibility of app design falls on either the Container or App Developer. In many cases, Container Developers will provide App Developers will visual designs, style guides or other assets required to ensure apps have the form and function for a given container. Container Developers may also [provide CSS for App Developers](about-f2.html#creating-a-common-look-and-feel) to adhere to&mdash;which should be easy since F2 enforces a [consistent HTML structure across all containers and apps](app-development.html#automatic-consistency).

---

## Developing F2 Apps

Let's take a close look at how to build an F2 app. We'll explain how to get an F2 AppID, what the `AppManifest` is all about, what output format your app needs to support, how the contents of the `AppContent.html` property work, and the two hooks for adding form and function to your app: `scripts` and `styles`.

Before opening your editor, [read the configuration assumptions](#configuration).

### F2 AppID

To develop an F2 app, you need a unique identifier called an **AppID**. This AppID will be unique to _your app_ across the entire open financial framework ecosystem. The format of the AppID looks like this: `com_companyName_appName`, where the `companyName` "namespace" is your company name and `appName` is the name of your app.

As an example, your AppID could look like this:

`com_acmecorp_watchlist`

If you built more than one app while working at Acme Corporation, you could create more AppIDs. All of these are valid:

- `com_acmecorp_watchlist2`
- `com_acmecorp_watchlist_big_and_tall`
- `com_acmecorp_static_charts`
- `com_acmecorp_interactive_charts`

To guarantee uniqueness, we have provided an AppID generation service that allows you to customize your AppID.

<a href="https://developer.openf2.com/GetAppID" class="btn btn-primary">Get Your F2 AppID Now &raquo;</a>

### Setting Up Your Project

Once you have your AppID, start by setting up your project. You will need at least one file: the **App Manifest**. Create a new file called `manifest.js`. Also, chances are you'll want custom styling and functionality, so go ahead and create `appclass.js` (for your app logic) and `app.css` for your CSS. Your project folder should look like this:

![](./img/project_folder.png 'Setup your project')

<span class="label label-default">Helper</span> [Download the F2 examples](http://docs.openf2.org/F2-examples.zip) or read about [setting up a basic container and app](#get-started) in Getting Started.

### App Manifest

For an app to be considered F2-capable, it must first have this basic structure&mdash;called the **App Manifest**&mdash;represented in [JSON](http://json.org):

```javascript
{
	"inlineScripts":[],
	"scripts":[],
	"styles":[],
	"apps":[{
			"data":{},
			"html":"",
			"status":""
	}]
}
```

The [App Manifest](./sdk/classes/F2.AppManifest.html) can be generated by the server-side code of your choice or be written-by-hand in your favorite text editor. In the [GitHub repository](https://www.github.com/OpenF2/F2), there are apps written in JavaScript, PHP, and C# to serve as examples to get you started.

When it's complete (using the examples further below), the App Manifest looks like this:

```javascript
F2_jsonpCallback_com_companyname_appname({
	inlineScripts: ['(function(){ var foo = bar; doSomething(); })()'],
	scripts: ['http://www.domain.com/js/appclass.js'],
	styles: ['http://www.domain.com/css/app.css'],
	apps: [
		{
			data: {
				foo: 'bar',
				value: 12345
			},
			html: '<div class="sunrise">Hello world.</div>',
			status: 'good'
		}
	]
});
```

Let's break the App Manifest object down and look at each property (in reverse order to keep it fun).

<span class="label label-info">Note</span> The `AppID` created in the Developer Center and specified in the AppManifest will get automatically **lowercased** by F2 when [integrated on a container](container-development.html#app-integration).

### Apps

The `apps` property is an array of `AppContent` objects. Each `AppContent` object contains three properties:

1. `html`
2. `data`
3. `status`

#### html

The `html` property contains the view of your app represented in (optionally encoded) HTML. While you can modify the way your app appears or functions within the container, the `html` property is what the container will show when it [registers your app](container-development.html#app-integration) and displays its contents for the first time.

Example:

```javascript
"html": "<div class=\"sunrise\">Hello world.</div>"
```

The _optionally encoded_ version of the `html` example above is:

```javascript
"html": "%3Cdiv%20class%3D%22sunrise%22%3EHello%20world.%3C%2Fdiv%3E"
```

#### data

The `data` property exists to support the placement of arbitrary data needing to be passed along with the app. _This field is optional._

Example:

```javascript
"data": {
	foo: "bar",
	value: 12345
}
```

#### status

The `status` property allows app developers to communicate a server-side arbitrary status code to itself or to the container. _This field is optional._

Example:

```javascript
"status": "good"
```

### Styles

The `styles` property is an array of URLs. The `styles` array refers to any CSS files needed by the app so it will be displayed properly on the container. The externally-referenced CSS files should be fully-qualified, including a protocol.

Example:

```javascript
"styles": [
	"http://www.domain.com/css/app.css"
]
```

In the case when multiple stylesheetes are needed, simply add to the array as shown in this example:

```javascript
"styles": [
	"http://www.domain.com/css/app.css",
	"http://www.domain.com/css/app-responsive.css"
]
```

[Read more about CSS and namespacing](#namespacing) inside your app.

<span class="label label-info">Note</span> URLs referenced in the Scripts and Styles arrays are loaded synchronously by F2.js, so be sure to order your scripts properly.

### Scripts

The `scripts` property is an array of URLs. The `scripts` array refers to any JavaScript files needed by the app so that it will function correctly on the container. The externally-referenced JS files should be fully-qualified.

Example:

```javascript
"scripts": [
	"http://www.domain.com/js/appclass.js"
]
```

In the case when multiple scripts are needed, simply add to the array as shown in this example:

```javascript
"scripts": [
	"http://www.domain.com/js/lib.js",
	"http://www.domain.com/js/appclass.js"
]
```

[Read more about JavaScript and namespacing](#namespacing) inside your app.

<span class="label label-info">Note</span> URLs referenced in the Scripts and Styles arrays are loaded _synchronously_ by F2.js, so be sure to order your scripts properly.

### Inline Scripts

The `inlineScripts` property is an array of strings. The `inlineScripts` array can include any JavaScript code needed by the app that _cannot be included in your [App Class](#scripts)_. The contents of the `inlineScripts` array will be evaluated as JavaScript (using `eval()`) when all `scripts` have finished loading.

Example:

```javascript
"inlineScripts": [
	"(function(){ var foo = bar; doSomething(); })()"
]
```

<div class="well well-sm">
<h4>About Inline Scripts</h4>
<p>While the use of `inlineScripts` is supported by F2's App Manifest, it is not recommended for use. There are many reasons for this, the main one is to avoid cluttering the global namespace. Developers should make every attempt to put their JavaScript code inside their [App Class](#scripts).</p>
</div>

[Read more about JavaScript and namespacing](#namespacing) inside your app.

<span class="label label-info">Note</span> URLs referenced in the Scripts and Styles arrays are loaded _synchronously_ by F2.js, so be sure to order your scripts properly.

### Sample App Manifest

If we use the examples above, our `AppManifest` would look like this:

```javascript
F2_jsonpCallback_com_companyname_appname({
	inlineScripts: ['(function(){ var foo = bar; doSomething(); })()'],
	scripts: ['http://www.domain.com/js/appclass.js'],
	styles: ['http://www.domain.com/css/app.css'],
	apps: [
		{
			data: {
				foo: 'bar',
				value: 12345
			},
			html: '<div class="sunrise">Hello world.</div>',
			status: 'good'
		}
	]
});
```

<span class="label label-info">Note</span> You may have noticed the presence of the function name `F2_jsonpCallback_com_companyname_appname` on the first line of the example above. That function name is the callback and is explained in [App Manifest Response](#app-manifest-response).

### App Manifest Response

OK, so you know about F2 apps and you're ready to write your own App Manifest. To go from zero to _something_, [download the F2 examples](http://docs.openf2.org/F2-examples.zip). Once you have your `AppManifest` defined (or at least stubbed out), there's one important detail you need to know now&mdash;the App Manifest response format.

As part of F2, containers register apps&mdash;typically hosted on different domains&mdash;using JSONP. **This means F2 App Manifest files must provide a JSONP callback function.** (If you don't know what JSONP is or how it works, we recommend [reading what Remy Sharp has to say](http://remysharp.com/2007/10/08/what-is-jsonp/) about it.)

For security reasons, the App Manifest JSONP callback function must be a specific, reliable, and testable format. F2 has defined that using a combination of a string and your unique F2 AppID. The JSONP callback function name looks like this:

`F2_jsonpCallback_<AppID>`

When applied, the final (bare bones) App Manifest file looks like this example (where `com_companyname_appname` is your AppID):

```javascript
//manifest.js
F2_jsonpCallback_com_companyname_appname({
	scripts: ['http://www.domain.com/js/appclass.js'],
	styles: ['http://www.domain.com/css/app.css'],
	apps: [
		{
			html: '<div class="sunrise">Hello world.</div>'
		}
	]
});
```

<span class="label label-info">Note</span> The JSONP callback function name will _not_ be passed from the container using a traditional querystring parameter (HTTP GET), so you must configure this correctly for your app to appear on a container. This means you have to hard-code it in your `AppManifest`.

<span class="label label-info">Note</span> The `AppID` created in the Developer Center will get automatically **lowercased** by F2 when [integrated on a container](container-development.html#app-integration).

### App HTML

While it isn't required, it's expected every F2 app has HTML. The only catch is that the HTML isn't provided by the app itself but rather passed to the container via the app's `AppManifest`. Here are the steps for getting your app HTML into your `AppContent.html` property:

1. Develop the web page or module or widget or component or portlet that will be your app.
2. Take all the contents of it&mdash;that is, the HTML&mdash;and encode it. _(This step is optional.)_
3. Put the (optionally encoded) result in the `html` property of your `AppContent` object within your App Manifest file's `App` object.

Wait, what? Check out this example below or [browse to example apps on GitHub](https://github.com/OpenF2/F2/tree/master/examples/apps):

Step 1.

```html
<div class="sunrise">Hello world.</div>
```

Step 2. Encoded HTML. _(Optional)_

```html
%3Cdiv%20class%3D%22sunrise%22%3EHello%20world.%3C%2Fdiv%3E
```

Step 3. App Manifest file.

```javascript
{
	...
	"apps":[{
		"html": "<div class=\"sunrise\">Hello world.</div>"
		...
	}]
}
```

<span class="label label-info">Note</span> You are not required to encode the app HTML, so follow steps 2 and 3 above omitting the encoding step.

#### Automatic Consistency

F2 uses and recommends [Bootstrap](http://getbootstrap.com) for Container and App Developers to benefit from a consistent HTML and CSS structure regardless of who developed the F2 component. This way, Container Developers can write CSS they _know_ will style F2 apps without engaging with the app developer to ensure compatibility.

This also means App Developers must adhere to [Bootstrap's grid system](http://getbootstrap.com/css/#grid) as defined on their website.

An example two-column layout using Bootstrap-specifed markup:

```html
<div class="row">
	<div class="col-md-4">...</div>
	<div class="col-md-8">...</div>
</div>
```

The `.col-md-4` and `.col-md-8` provide two columns in the [12-column grid](http://getbootstrap.com/css/#grid).

<span class="label label-default">Note</span> Read more about [Creating a Common Look and Feel with F2](about-f2.html#container).

### Scripts & Styles

Once your app is on the container, chances are you'll want it to actually do something. As an app developer, it is entirely up to you to write your own stylesheets and javascript code to add form and function to your app. F2's standardized App Manifest provides hooks for your CSS and scripts to get onto the container&mdash;just use the `scripts` and `styles` arrays detailed above in the [App Manifest](#app-manifest).

### Styles

Including your own CSS in the `styles` array of the App Manifest opens the door to the potential of unexpected display issues. Therefore, as an app developer, you are required to properly namespace your CSS selectors and declarations. For the details on writing correctly namespaced code, [read the namespacing docs](#namespacing).

It is recommended you include your app styles in a file named `app.css`.

### Scripts

#### App Class

While it isn't required, it's expected all F2 apps will ship with javascript. This code should be included in an `appclass.js` file as shown in [Setting Up Your Project](#setting-up-your-project). The `F2.Apps` property is a namespace for app developers to place the javascript class that is used to initialize their app. The javascript classes should be namepaced with the `F2.App.AppID`. It is recommended that the code be placed in a closure to help keep the global namespace clean.

For more information on `F2.Apps`, [browse over to the F2.js SDK docs](./sdk/classes/F2.App.html).

To make it even easier to build F2 apps and for faster app loading by the container, the F2.js SDK provides automatic JavaScript method execution at appropriate times during `F2.registerApps()` (and the internal `_loadApps()` method). If the class has an `init()` function, it will be called automatically during execution of F2's `registerApps()` method.

We recommend&mdash;and have samples below for&mdash;two different patterns for writing your `appclass.js` code: prototypal inheritence or the module pattern.

#### Arguments

When F2's `registerApps()` method is called by the container, F2 passes three arguments to your App Class: `appConfig`, `appContent` and `root`. The SDK documentation details the contents of each arg and these should be familiar because [appConfig](./sdk/classes/F2.App.html) contains your app's meta, [appContent](./sdk/classes/F2.AppManifest.AppContent.html) contains your `html`, `data` and `status` properties, and [root](./sdk/classes/F2.AppConfig.html#properties-root) is the outermost DOM element in which your app exists on the container. The `root` argument provides your App Class code your app's parent (root) element for faster DOM traversal.

Example:

```javascript
//appclass.js snippet
...
	var App_Class = function(appConfig, appContent, root) {
...
```

#### Prototypal Inheritance Pattern

We won't even begin to talk about or describe this fantastic design pattern simply because Douglas Crockford [has already written](http://javascript.crockford.com/prototypal.html) [all about it](http://javascript.crockford.com/inheritance.html).

An example of an App Class using prototypal inheritance inside a [closure](http://davidbcalhoun.com/2011/what-is-a-closure-in-javascript) is below. Note the inclusion of the `App_Class.prototype.init()` function&mdash;which will be called automatically during app load&mdash;and the [trailing parentheses](http://peter.michaux.ca/articles/an-important-pair-of-parens), `()`, which are responsible for automatic function execution. Thanks to the closure, the `App_Class` is returned _and_ assigned to `F2.Apps["com_companyname_appname"]`.

```javascript
F2.Apps['com_companyname_appname'] = (function () {
	var App_Class = function (appConfig, appContent, root) {
		// constructor
	};

	App_Class.prototype.init = function () {
		// perform init actions
	};

	return App_Class;
})();
```

#### Module Pattern

As an alternative to the prototypal inheritance pattern above, `appclass.js` code could be written following the module pattern shown in the example below. Note the inclusion of an `init()` function&mdash;which will be called automatically during app load&mdash;and the _exclusion_ of the closure and trailing parentheses present in the example using prototypal inheritance above.

```javascript
F2.Apps['com_companyname_appname'] = function (appConfig, appContent, root) {
	return {
		init: function () {
			// perform init actions
		}
	};
};
```

#### Patterns, Eh

Of course, you don't have to use either one of these patterns in your `appclass.js` file. What you _do_ have to use is a `function`. That is to say the value assigned to `F2.Apps["com_companyname_appname"]` by your App Class code _must be a function_. Within F2's `registerApps()` method, the `new` operator is used which produces an object and new instance of your app.

<div class="alert alert-warning">
	<h5>Important!</h5>
	<p>In the absence of a function in your `appclass.js`, F2 will be unable to load your app on a container.</p>
</div>

If you don't want to think about any of this and would rather just start coding, [download the F2 examples](http://docs.openf2.org/F2-examples.zip).

---

### Internationalization

Internationalization, or "[i18n](http://en.wikipedia.org/wiki/Internationalization_and_localization)", can be [configured in a Container](container-development.html#internationalization). This "locale" information is shared with all Apps using [IETF-defined standard language tags](http://en.wikipedia.org/wiki/IETF_language_tag) such as "en-us" or "de-de" for English United States or German Germany, respectively.

<span class="label label-danger">Important</span> Containers providing a `locale` config is only a means of communicating localization information in the container. F2 does not perform translations, number formatting or other localization modifications to Containers or Apps.

#### Changing the Locale

Container Providers can change the current locale using [F2.Events](./sdk/classes/F2.Events.html). There is an event constant available for changing the locale called `CONTAINER_LOCALE_CHANGE`.

App Providers can listen for locale changes.

```javascript
var currentLocale = F2.getContainerLocale(); //en-us

//listen for Container-broadcasted F2 event with new locale
F2.Events.on(F2.Constants.Events.CONTAINER_LOCALE_CHANGE, function (data) {
	//get newly-updated locale
	currentLocale = F2.getContainerLocale(); //en-gb
});
```

#### How Do Apps Understand Locale?

There is a parameter sent to each `AppManifest` request during `F2.registerApps` called `containerLocale`. Apps can also call `F2.getContainerLocale()` to access the current locale of the container.

Here is an example of the two ways of getting the container locale inside an AppClass.

```javascript
F2.Apps['com_companyname_appname'] = (function () {
	var App_Class = function (appConfig, appContent, root) {
		// "containerLocale" is added to the AppConfig
		// during F2.registerApps
		console.log(appConfig.containerLocale); //en-us
	};

	App_Class.prototype.init = function () {
		// get locale using helper function
		// if locale changes, this function will
		// always return the current locale
		console.log(F2.getContainerLocale()); //en-us
	};

	return App_Class;
})();
```

<span class="label label-info">Note</span> For more detail on the `containerLocale` property, browse to the SDK for [F2.AppConfig](./sdk/classes/F2.AppConfig.html#properties-containerLocale).

#### How to Indicate Locale Support

The F2 `AppConfig` has a `localeSupport` property (type Array) so each App can define the region and language combinations it supports. Container code could be written to inspect the `localeSupport` property of any apps before registering them.

Sample `AppConfig` showing the `localeSupport` property:

```javascript
{
    "appId": "com_companyName_appName",
    "manifestUrl": "http://www.domain.com/manifest.js"
    "name": "App Name",
    "views": ["home", "settings", "about"],
    "minGridSize": 4,
    "localeSupport": ["en-us","en-gb"] //array of IETF-defined tags
},
```

<span class="label label-info">Note</span> For more detail on the `localeSupport` property, browse to the SDK for [F2.AppConfig](./sdk/classes/F2.AppConfig.html#properties-localeSupport).

---

## Namespacing

F2 is a _web_ integration framework which means apps are inherently insecure. Following this spec, App Developers must avoid CSS collisions and JavaScript namespace issues to provide users with the best possible experience.

### Namespacing CSS

As discussed in [Developing F2 Apps: F2 AppID](#f2-appid), to develop an F2 app, you need a unique identifier called an AppID. This AppID will be unique to your app across the entire open financial framework ecosystem. The format of the AppID looks like this: `com_companyName_appName`, where the `companyName` "namespace" is your company name and `appName` is the name of your app.

When Container Developers [register apps](container-development.html#app-integration), F2.js draws each app as defined by the [ContainerConfig](container-development.html#container-config). Before the app is added to the container DOM, F2 automatically wraps an outer HTML element&mdash;with the AppID used as a class&mdash;around the rendered app.

This example shows app HTML after it has been drawn on the container. Note the `com_companyName_appName` classname.

```html
<div class="f2-app-container com_companyName_appName">...</div>
```

To avoid styling conflicts or other display issues related to app-provided style sheets, **App Developers must namespace their CSS selectors.** Fortunately, this is quite easy.

Every selector in app-provided style sheets must look like this:

```css
.com_companyName_appName p {
	padding: 5px;
}

.com_companyName_appName .alert {
	color: red;
}
```

Note `.com_companyName_appName` is prefixed on both `p` and `.alert` selectors.

While the [CSS cascade](http://www.webdesignfromscratch.com/html-css/css-inheritance-cascade/) will assign more points to IDs and while prefixing F2 AppIDs on CSS selectors isn't required, it is recommended.

```css
.com_companyName_appName #notice {
	background-color: yellow;
}
```

<span class="label label-default">Note</span> App Developers should familiarize themselves with [CSS namespacing rules for Container Developers](container-development.html#namespacing). They are largely the same with a couple notable additions.

#### About CSS Resets

It is a common web development practice to use [CSS resets](http://meyerweb.com/eric/tools/css/reset/), and it is likely both Container and App Developers will use them. Since there are many ways to normalize built-in browser stylesheets, including [Normalize.css](http://necolas.github.com/normalize.css/) which is used by Bootstrap, Container and App Developers must namespace their CSS reset selectors.

### Keeping JavaScript Clean

Adhering to one of the [OpenAjax Alliance](http://www.openajax.org/) goals, F2 also promotes the concept of an uncluttered global javascript namespace. For Container and App Developers alike, this means following this spec closely and ensuring javascript code is contained inside [closures](http://jibbering.com/faq/notes/closures/) or is extended as a new namespace on `F2`.

To ensure javascript bundled with F2 apps executes in a javascript closure, [follow the guidelines](#scripts-1) for the `appclass.js` file and one of the two patterns described (prototypal inheritance or module).

The [F2.js SDK](f2js-sdk.html) was designed with extensibility in mind and therefore custom logic can be added on the `F2` namespace.

Example:

```javascript
F2.extend(
	'YourPluginName',
	(function () {
		return {
			doSomething: function () {
				F2.log('Something has been done.');
			}
		};
	})()
);
```

For more information, read [Extending F2](extending-f2.html).

---

## Context

### What is Context?

Apps are capable of sharing "context" with the container and other nearby apps. All apps have context which means the app "knows" who is using it and the content it contains. It is aware of an individual's data entitlements and user information that the container is requested to share (name, email, company, etc).

This means if a user wants to create a ticker-focused container so they can keep a close eye on shares of Proctor & Gamble, the container can send "symbol context" to any listening apps that are smart enough to refresh when ticker symbol PG is entered in the container's search box.

While apps can have context themselves, the responsibility for managing context switching or context passing falls on the container. The container assumes the role of a traffic cop—managing which data goes where. By using JavaScript events, the container can listen for events sent by apps and likewise apps can listen for events sent by the container. To provide a layer of security, this means apps cannot communicate directly with other apps on their own; apps must communicate via an F2 container to other apps since the container controls the [F2.Events API](./sdk/classes/F2.Events.html).

[Read more in the Framework](about-f2.html#framework).

Let's look at some code.

### Container-to-App Context

In this example, the container broadcasts, or emits, a javascript event defined in `F2.Events.Constants`. The `F2.Events.emit()` method accepts two arguments: the event name and an optional data object.

```javascript
F2.Events.emit(F2.Constants.Events.CONTAINER_SYMBOL_CHANGE, {
	symbol: 'AAPL',
	name: 'Apple, Inc.'
});
```

To listen to the `F2.Constants.Events.CONTAINER_SYMBOL_CHANGE` event inside your F2 app, you can use this code to trigger an alert dialog with the symbol:

```javascript
F2.Events.on(F2.Constants.Events.CONTAINER_SYMBOL_CHANGE, function (data) {
	F2.log('The symbol was changed to ' + data.symbol);
});
```

The `F2.Events.on()` method accepts the event name and listener function as arguments. [Read the SDK](./sdk/classes/F2.Events.html) for more information.

<span class="label label-default">Note</span> For a full list of support event types, browse to the SDK for [F2.Constants.Events](./sdk/classes/F2.Constants.Events.html).

### Container-to-App Context (Server)

Often times containers will want to send context to apps during [app registration](./sdk/classes/F2.html#methods-registerApps). This is possible through the `AppConfig.context` property. This [property](./sdk/classes/F2.AppConfig.html#properties-context) can contain any javascript object&mdash;a string, a number, an array or an object.

```javascript
//define app config
var _appConfigs = [
	{
		appId: 'com_acmecorp_news',
		description: 'Acme Corp News',
		manifestUrl: 'http://www.acme.com/apps/news-manifest.js',
		name: 'Acme News App',
		context: {
			sessionId: myApp.sessionId,
			someArray: [value1, value2]
		}
	}
];
```

When `F2.registerApps()` is called, the `appConfig` is serialized and appended to the app's manifest URL. The serialized object converts to [stringified JSON](./sdk/classes/F2.html#methods-stringify):

```javascript
{"appId":"com_acmecorp_news","description":"Acme Corp News","manifestUrl":"http://www.acme.com/apps/news-manifest.js","name":"Acme News App","context":{"sessionId":"12345", "someArray":["value1","value2"]}}
```

The `appConfig` object is sent to the server using the `params` querystring name as shown in the example below. This is the complete app manifest request sent by `F2.registerApps()` with the `appConfig` URL-encoded, of course:

```html
http://www.acme.com/apps/news-manifest.js?params=%7B%22appId%22%3A%22com_acmecorp_news%22%2C%22description%22%3A%22Acme%20Corp%20News%22%2C%22manifestUrl%22%3A%22http%3A%2F%2Fwww.acme.com%2Fapps%2Fnews-manifest.js%22%2C%22name%22%3A%22Acme%20News%20App%22%2C%22context%22%3A%7B%22sessionId%22%3A%2212345%22%2C%20%22someArray%22%3A%5B%22value1%22%2C%22value2%22%5D%7D%7D
```

This demonstrates complete flexibility of passing arbitrary context values from the container to any F2 app.

<span class="label label-danger">Important</span> To receive context from a container during app initialization, F2 App Developers are required to build object deserialization for the `params` value into their app code.

<span class="label label-default">Note</span> It is possible to override the `AppManifest` request and, among other things, change the default HTTP method from `GET` to `POST`. This is useful in a scenario when the serialized `AppConfig` exceeds the maximum URL length or when `AppConfig.context` contains secure information necessitating a `POST`. [Read more about overriding the AppManifest request](container-development.html#override-the-appmanifest-request).

### App-to-Container Context

In this example, your app emits an event indicating a user is looking at a different stock ticker _within your app_. Using `F2.Events.emit()` in your code, your app broadcasts the new symbol. As with container-to-app context passing, the `F2.Events.emit()` method accepts two arguments: the event name and an optional data object.

```javascript
F2.Events.emit(F2.Constants.Events.APP_SYMBOL_CHANGE, {
	symbol: 'MSFT',
	name: 'Microsoft, Inc.'
});
```

The container would need to listen to your app's broadcasted `F2.Constants.Events.APP_SYMBOL_CHANGE` event using code like this:

```javascript
F2.Events.on(F2.Constants.Events.APP_SYMBOL_CHANGE, function (data) {
	F2.log('The symbol was changed to ' + data.symbol);
});
```

<span class="label label-default">Note</span> For a full list of support event types, browse to the SDK for [F2.Constants.Events](./sdk/classes/F2.Constants.Events.html).

### App-to-App Context

Apps can also pass context between apps. If there are two or more apps on a container with similar context and the ability to receive messages (yes, through event listeners, context receiving is opt-in), apps can communicate with each other. To communicate with another app, each app will have to know the event name along with the type of data being passed. Let's take a look.

Within "App 1", context is _sent_ using `F2.Events.emit()`:

```javascript
F2.Events.emit(
	'buy_stock', //custom event name
	{
		symbol: 'GOOG',
		name: 'Google Inc',
		price: 682.68,
		isAvailableToPurchase: true,
		orderType: 'Market Order'
	}
);
```

Within "App 2", context is _received_ using `F2.Events.on()`:

```javascript
F2.Events.on('buy_stock', function (data) {
	if (data.isAvailableToPurchase) {
		F2.log('Trade ticket order for ' + data.symbol + ' at $' + data.price);
	} else {
		F2.log('This stock is not available for purchase.');
	}
});
```

### More Complex Context

The examples above demonstrate _simple_ Context objects. In the event more complex data and/or data types are needed, F2 Context can support any JavaScript object&mdash;a string, a number, a function, an array or an object.

This is an example Context object demonstrating arbitrary JavaScript objects:

```javascript
F2.Events.emit(
	'example_event', //custom event name
	{
		//number
		price: 100,
		//string
		name: 'John Smith',
		//function
		callback: function () {
			F2.log('Callback!');
		},
		//array
		watchlist: ['AAPL', 'MSFT', 'GE'],
		//object
		userInfo: {
			name: 'John Smith',
			title: 'Managing Director',
			groups: ['Alpha', 'Beta'],
			sessionId: 1234567890
		}
	}
);
```

If two apps want to communicate data for populating a trade ticket _and_ execute a `callback`, [appclass.js](#scripts-1) code might look like this:

```javascript
F2.Events.emit(
	'buy_stock', //custom event name
	{
		symbol: 'GOOG',
		name: 'Google Inc',
		price: 682.68,
		isAvailableToPurchase: true,
		orderType: 'Market Order',
		//define callback
		callback: function (data) {
			alert('Trade ticket populated');
		}
	}
);
```

The F2 app listening for the `buy_stock` event would fire the `callback` function.

```javascript
F2.Events.on('buy_stock', function (data) {
	F2.log('Trade ticket order for ' + data.symbol + ' at $' + data.price);
	//..populate the trade ticket...
	//fire the callback
	if (typeof data.callback === 'function') {
		data.callback();
	}
});
```

### Types of Context

Context is a term used to describe the state of an F2 container and its apps. At the same time, Context is also the information passed from [Container-to-App](#container-to-app-context) or from [App-to-App](#app-to-app-context) or from [App-to-Container](#app-to-container-context). In the examples shown above, two types of context were shown: symbol and trade ticket context. It is important to realize F2.js allows client-side messaging between third parties using a collection of arbitrary name-value pairs. This provides the utmost flexibility and affords Container Developers the option to define context within their container.

#### Universal F2 Instrument ID

Said another way, while `{ symbol:"AAPL", name: "Apple, Inc" }` can be used to communicate symbol context, developers could also use `{ symbol: "123456789" }` to identify Apple, Inc. The latter is more likely given not all apps would programmatically understand `AAPL` but&mdash;given symbol lookup services&mdash;would understand `123456789` as the universal _F2_ identifier for Apple, Inc. It is clear Container and App Developers alike would prefer to communicate with a guaranteed-to-never-change universal ID for all instrument types across all asset classes.

F2 will be providing lookup web services in future releases that provide universal F2 identifiers for container and app providers. These lookup services will not just be limited to symbols. _Further details will be forthcoming as the F2 specification evolves._

---

## Container Integration

Good news! The container is responsible for loading its apps, and as long as you've followed F2's standard for [App Manifests](#app-manifest) and have a working&mdash;and tested&mdash;app, you're pretty much done.

If you're curious about _how_ containers load apps, browse to the [F2.js SDK `registerApps()` method](./sdk/classes/F2.html#method_registerApps) or [read Container Development](container-development.html#app-integration).

#### Testing Your App

When you [cloned the F2 GitHub repo](https://github.com/OpenF2/F2/#quick-start) you also got an example F2 container for your app development and testing. Open the project repository and navigate to `~/F2/examples/container` to find them or to jump-start your testing, point your browser at:

`http://localhost/F2/examples/container/`

If you open `~/F2/examples/container/js/sampleApps.js` in your text editor, you'll find a list of sample F2 apps broken down by programming language. Simply modify this file to your liking and add your app anywhere in the appropriate array (JavaScript, PHP or C#). The configuration is comprised of `F2.AppConfig` properties, and the following are the minimum **required** properties.

```javascript
{
	appId: "com_companyName_appName",
	manifestUrl: "http://www.domain.com/manifest.js"
}
```

For full details on these `F2.AppConfig` properties and all the others, [browse the F2.js SDK documentation](./sdk/classes/F2.AppConfig.html).

---

## Entitlements

User or content entitlements are the responsibility of the App Developer. Many apps will need to be decoupled from the content that they need. This could include apps like research aggregation, news filtering, streaming market data, etc. Similarly to how companies build their own websites today with their own authentication and access (or content) entitlements, F2 apps are no different.

_Further details around app entitlements will be forthcoming as the F2 specification evolves._

---

## Single Sign-On

Single sign-on (SSO) is a shared responsibility between the Container and App Developer. In some cases, containers will want all of its apps to be authenticated seamlessly for users;that will be negotiated between Container and App Developers. For the purposes of this documentation, it is assumed Container Developers will build and host their container access authentication.

Once a user is authenticated on the container, how is the user then authenticated with all of the apps? [Encrypted URLs](#using-encrypted-urls).\*

<span class="label label-default">Note</span> The Container Developer is free to utilize any app authentication method they deem fit. Container Developers and app developers will need to work together to finalize the authentication details.

### Using Encrypted URLs

Implementing SSO using encrypted URLs is a simple and straight-forward authentication mechanism for securing cross-domain multi-provider apps. To guarantee security between the Container and App Developer, secure API contracts must be negotiated. This includes, but is not limited to, the choice of cryptographic algorithm (such as `AES`) and the exchange of public keys.

When the container provider calls `F2.registerApps()`, custom logic should be added to append encrypted user credentials&mdash;on a need-to-know basis&mdash;to _each app_ requiring authentication.

[Read more in Developing F2 Containers](container-development.html).

### Considerations

Authentication is a critical part of any container-app relationship. There are a plethora of SSO implementations and there are many considerations for both Container and App Developers alike.

_Further details around container and app single sign-on will be forthcoming as the F2 specification evolves._

---
