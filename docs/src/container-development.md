# Container Development

<p class="lead">
The container is the foundation of any F2-enabled solution. By leveraging the [F2.js SDK](f2js-sdk.html), Container Providers offer a consistent and reliable mechanism for all App Developers to load their apps on that container regardless of where it is hosted, who developed it, or what back-end stack it uses. You can [read more about the framework](about-f2.html#framework), [download the project on GitHub](https://github.com/OpenF2/F2#quick-start) or [get started](#get-started) below.
</p>

* * * *

## Get Started

To help you get started building an F2 container, review the documentation and examples below. To jump start your F2 container or app development, download the F2 example container and apps.

<p><a href="http://docs.openf2.org/F2-examples.zip" class="btn btn-primary btn-small">Download F2 Examples</a></p>

### Basic Example

To begin, you **do not** need to build (or compile) F2 [as described in the readme on GitHub](https://github.com/OpenF2/F2#build-f2). Simply download [F2.js](f2js-sdk.html) and [Bootstrap](http://getbootstrap.com), and ensure you're [properly configured](#configuration) for continuing with the documentation.

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

<span class="label label-info">Note</span> In developing a more advanced container, the HTML document's `body` element would contain additional markup and allow for [specific positioning or placement of apps](#apphandlers-for-app-layout). Additionally, more advanced containers could introduce features and functionality to their apps in the form of authentication APIs, streaming data feeds, federated search, etc. All containers must follow the [F2 design guidelines](#container-design).

#### AppConfig & Init

```javascript
var _appConfig = {
    appId: 'com_openf2_examples_javascript_helloworld',
    manifestUrl: 'http://docs.openf2.org/demos/apps/JavaScript/HelloWorld/manifest.js'
};
 
$(function(){
    F2.init();
    F2.registerApps(_appConfig);
});
```

<span class="label label-info">Note</span> For more information about the `AppConfig`, [read up on them](#appconfigs) in App Integration.

#### Working Example

Now with a basic container and a basic app, combine these two for a working example. Press **Result** in this jsfiddle.

<iframe width="100%" height="300" src="http://jsfiddle.net/OpenF2js/RTXg3/embedded/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

In getting to this point, you've only scratched the surface of F2 containers and apps. Continue reading and understanding the F2 spec to build exactly the financial solutions that our customers want.

### Sample Apps and Container

Good news! In the [project repo on GitHub](https://github.com/OpenF2/F2/tree/master/examples/), you will find a basic container along with a number of sample apps which demonstrate functionality far beyond the basic app above. Once you clone or download the project repository, open the sample container by pointing your browser at:

`http://localhost/F2/examples/`

These examples are also available in a separate archive if you don't want to download the entire repository. 

<p><a href="http://docs.openf2.org/F2-examples.zip" class="btn btn-primary btn-small">Download F2 Examples</a></p>

### Integrating Apps

Full details on [App Integration](#app-integration) approaches are below. For an even simpler App integration than this basic example above, see [auto-loading Apps](#auto-loading-apps).

### Configuration

It is assumed you will be developing an F2 container locally and have a `localhost` setup. The URLs mentioned in this specification also assume you have configured your F2 container to run at `http://localhost/F2/`. The examples provided as part of the project repository demonstrate apps written in different languages (PHP, JavaScript, C#). While it is not a requirement you have a web server configured on your computer, it will certainly allow you to more deeply explore the sample apps.

To better understand F2 and the role of containers, you need to understand the role of apps. If you haven’t already, [read more about apps in the Framework](about-f2.html#framework). 

To get started working with or developing apps, browse to the [documentation for developing apps](app-development.html).

<p><a href="#developing-f2-containers" class="btn btn-primary btn-small">Developing F2 Containers</a> <a href="./sdk/" class="btn btn-default btn-small">F2.js SDK Reference</a></p>

* * * *

## Container Design

Design considerations are an important first step when creating a new container. Content can range from news to research to multimedia, and content should be presented using [Progressive Enhancement]((http://www.alistapart.com/articles/understandingprogressiveenhancement/), [Mobile First](http://www.lukew.com/presos/preso.asp?26) and [Responsive Design](http://www.abookapart.com/products/responsive-web-design) methodologies. That is to say multimedia content, for example, should be shown plugin-free (using HTML5 video or audio elements) for capable browsers and fallback to Flash-based players for browsers that do not yet support HTML5 related technologies. ([VideoJS](http://videojs.com/) is good example of open-source JavaScript and CSS "that makes it easier to work with and build on HTML5 video, today.")

If App Developers embed URLs back to their own websites or to third party sites, URLs must be opened in a new window as to not interrupt the experience of someone using the container. If authentication is required on an App Developer's site, this can be accomplished with pass-through authentication using encrypted URLs as discussed in [Single Sign On](#single-sign-on).

### Choices

In order to ensure that containers built using F2 are successful, they must be accessible. As such, F2 made choices for which open-source libraries and frameworks would be leveraged to reduce the level of effort across F2 adopters. 

[Read more about those choices in the Framework](about-f2.html#choices).

Ultimately, the responsibility of app design falls on either the Container or App Developer or both. In many cases, Container Developers will provide App Developers will visual designs, style guides or other assets required to ensure apps have the form and function for a given container. Container Developers may also [provide CSS for App Developers](about-f2.html#creating-a-common-look-and-feel) to adhere to&mdash;which should be easy since F2 enforces a [consistent HTML structure across all containers and apps](app-development.html#automatic-consistency). In other cases, Container and App Developers may never know each other and it's important everyone strictly adheres to the guidelines set forth in this documentation.

* * * *

## Developing F2 Containers

A container is a browser-based web application which brings F2 apps together onto a seamless user interface. It can also provide data and user context to its apps in the form of request-response web services or streaming data feeds.

### Including the F2 SDK

For a webpage to be considered an F2 container, it must first include the [F2.js JavaScript SDK](f2js-sdk.html). This is as simple as [downloading the F2 project from GitHub](f2js-sdk.html#download) and adding a `script` tag to the page. 

```javascript
<script src="/path/to/your/f2.js"></script>
```

You will find a basic container in the [project repo on GitHub](https://github.com/OpenF2/F2/tree/master/examples/) along with a number of sample apps. Once the script tag has been added, it is up to the Container Developer to configure and customize the container. The first step is getting a ContainerID.

### F2 ContainerID

To develop a production F2 container, you need a unique identifier called a ContainerID. This ContainerID will be unique to _your container_ across the entire open financial framework ecosystem. The format of the ContainerID looks like this: `com_container_companyName_containerName`, where the `companyName` "namespace" is your company name and `containerName` is the name of your container.

As an example, your ContainerID could look like this:

`com_container_acmecorp_watchlist`

If you built more than one container while working at Acme Corporation, you could create more ContainerIDs. All of these are valid:

* `com_container_acmecorp_activetrader`
* `com_container_acmecorp_retail`
* `com_container_acmecorp_mobilestreamer`

To guarantee uniqueness, we will provide a ContainerID generation service that allows customization of your ContainerID in the [Developer Center](about-f2.html#developer-center).

### Setting Up Your Project

Once you have your ContainerID, start by setting up your container project. You will need at least one configuration in addition to an HTML page: the app configs. (In the GitHub repository, [an example](https://github.com/OpenF2/F2/blob/master/examples/container/js/sampleApps.js) is found in `/examples/container/js/sampleApps.js`.) This doesn't need to be a static javascript file like `sampleApps.js` but the structure and format of the app configs is important.

## Container Config

The [F2.js JavaScript SDK](f2js-sdk.html) provides an API for providers to configure their containers. Every container must be setup using `ContainerConfig` and the [methods available](./sdk/classes/F2.ContainerConfig.html), however if the F2 defaults are acceptable, the `ContainerConfig` is not required.

To initialize a container _using F2 defaults_, call this function:

```javascript
F2.init();
```

To initialize a container with a `ContainerConfig`, use:

```javascript
F2.init({
    UI: {},
    xhr: function(){},
    supportedViews: []
});
```

Review all of the `ContainerConfig` properties in the [reference documentation](./sdk/classes/F2.ContainerConfig.html). 

To see a more detailed example of `F2.init()`, [look at the sample container javascript](https://github.com/OpenF2/F2/blob/master/examples/container/js/container.js) in the F2 repo on GitHub.

### Debug Mode

To enable debug mode in a container, use the following [property](./sdk/classes/F2.ContainerConfig.html) in `F2.init()`. Setting `debugMode: true` adds additional logging, resource cache busting, etc.

```javascript
F2.init({
   debugMode: true 
});
```

<span class="label label-warning">Note</span> For obvious reasons, this property should only be used in a development environment.

### AppRender, BeforeAppRender, AfterAppRender

The `appRender()`, `beforeAppRender()`, and `afterAppRender()` methods were deprecated in F2 version 1.2 in favor of [`F2.AppHandlers`](#apphandlers-for-app-layout). Upgrading to F2 1.2 will not break existing containers using any of these methods as they are still present in the SDK.

For more information, see [AppHandlers for App Layout](#apphandlers-for-app-layout).

### Internationalization 

To configure internationalization, or "[i18n](http://en.wikipedia.org/wiki/Internationalization_and_localization)", in an application the region and language can be set on the `ContainerConfig`. This "locale" information is shared with all Apps using [IETF-defined standard language tags](http://en.wikipedia.org/wiki/IETF_language_tag).

Configuration of current region and language using the `locale`:

```javascript
F2.init({
    locale: 'en-us'
});
```

<span class="label label-danger">Important</span> Providing a `locale` config is only a means of communicating localization information in the container. F2 does not perform translations, number formatting or other localization modifications to Containers or Apps.

#### Changing the Locale

Container Providers can change the current locale using [F2.Events](./sdk/classes/F2.Events.html). There is an event constant available for changing the locale called `CONTAINER_LOCALE_CHANGE`. 

Here is an example of triggering the locale change event:

```javascript
var currentLocale = F2.getContainerLocale(); //en-us

//emit F2 event with new locale
F2.Events.emit(F2.Constants.Events.CONTAINER_LOCALE_CHANGE,{
    locale: 'en-gb'
});

//get newly-updated locale
currentLocale = F2.getContainerLocale(); //en-gb
```

#### How Do Apps Understand Locale? 

There is a parameter sent to each `AppManifest` request during `F2.registerApps` called `containerLocale`. Apps can also call `F2.getContainerLocale()` to access the current locale of the container.

Here is an example of the two ways of getting the container locale inside an AppClass.

```javascript
F2.Apps["com_companyname_appname"] = (function() {
    var App_Class = function(appConfig, appContent, root) {
        // "containerLocale" is added to the AppConfig 
        // during F2.registerApps
        console.log(appConfig.containerLocale);//en-us
    }
 
    App_Class.prototype.init = function() {
        // get locale using helper function
        // if locale changes, this function will
        // always return the current locale
        console.log(F2.getContainerLocale());//en-us
    }

    return App_Class;
})();
```

<span class="label label-info">Note</span> For more detail on the `containerLocale` property, browse to the SDK for [F2.AppConfig](./sdk/classes/F2.AppConfig.html#properties-containerLocale).

#### Which Apps Support a Locale?

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

### Setting Up a Loading GIF

Container Developers have the opportunity to customize some user interface (UI) elements which propagate to the App Developers' toolkit in F2.js. One of those is `F2.UI.Mask`. The `Mask` object contains configuration defaults for the `F2.UI.showMask()` and `F2.UI.hideMask()` methods.

An example of setting the mask in `F2.init()`:

```javascript
F2.init({
    UI:{
        Mask:{
            loadingIcon:'./img/spinner.gif',
            backgroundColor: '#fff',
            opacity: 0.5
        }
    }
});
```

Included in the `F2.UI.Mask` configuration object are the following properties: `backgroundColor`, `loadingIcon`, `opacity`, `useClasses`, and `zIndex`. Each of these `F2.UI.Mask` properties is detailed in [the F2.js SDK docs](./sdk/classes/F2.ContainerConfig.UI.Mask.html).

For more information on `F2.UI`, [browse to the F2.js SDK docs](./sdk/classes/F2.UI.html).

### Override the AppManifest Request

Occasionally Container Developers need more granular control over the `AppManifest` request mechanism in F2.js. The [manifest request process](./sdk/classes/F2.html#methods-registerApps)&mdash;intentionally obscured from developers through the `F2.registerApps()` API&mdash;is handled by a simple ajax call to an HTTP endpoint. (F2 relies on `jQuery.ajax()` for this.)  In version {{version}} of F2, the `AppManifest` request can be overridden in the Container Config. 

<span class="label label-info">Note</span> The `AppManifest` endpoint is configured in the `manifestUrl` property within each [`AppConfig`](#appconfigs).

The following example demonstrates how the `xhr` property of the `ContainerConfig` is used to override F2.js.

```javascript
F2.init({
    xhr: function(url, appConfigs, success, error, complete) {
        $.ajax({
            url: url,
            type: 'POST',
            data: {
                params: F2.stringify(appConfigs, F2.appConfigReplacer)
            },
            jsonp: false, // do not put 'callback=' in the query string
            jsonpCallback: F2.Constants.JSONP_CALLBACK + appConfigs[0].appId, // Unique function name
            dataType: 'json',
            success: function(appManifest) {
                // custom success logic
                success(appManifest); // fire success callback
            },
            error: function() {
                // custom error logic
                error(); // fire error callback
            },
            complete: function() {
                // custom complete logic
                complete(); // fire complete callback
            }
        });
    }
});
```

### Extending XHR

The `F2.ContainerConfig.xhr` property has two additional customizable properties available: `dataType` and `type`. 

#### DataType

The `dataType` property allows the container to override the request data type (JSON or JSONP) that is used for the request. Using JSON as a `dataType` is only available for F2 apps running on the same domain as the container.

```javascript
F2.init({
    xhr: {
        dataType: function(url) {
            return F2.isLocalRequest(url) ? 'json' : 'jsonp';
        }
    }
});
```

#### Type

The `type` property allows the container to override the request method that is used (similar to the [type parameter to jQuery.ajax()](http://api.jquery.com/jQuery.ajax/)). Since HTTP POST is not supported on JSONP requests, using POST as a `type` is only available for F2 apps using JSON and are therefore running on the same base domain as the container.

```javascript
F2.init({
    xhr: {
        type: function(url) {
            return F2.isLocalRequest(url) ? 'POST' : 'GET';
        }
    }
});
```

For more information on `F2.ContainerConfig.xhr`, [browse to the F2.js SDK docs](./sdk/classes/F2.ContainerConfig.html).

### Override the Request for App Dependencies 

Occasionally Container Developers need more granular control over the request mechanism in F2.js for `AppManifest`-defined dependencies. The current dependency request process is handled by the straightforward `createElement('script')` and `createStyleSheet()` statements for scripts and styles, respectively. In version {{version}} of F2, the app dependency request can be overridden in the [`ContainerConfig`](./sdk/classes/F2.ContainerConfig.html).

#### Override the Script Loader

As defined in the `AppManifest`, each F2 App can have script file dependencies. These are [defined as URLs](app-development.html#app-manifest) in the `AppManifest.scripts` property (type array). The script loader can be replaced with any script loading mechanism such as those found in [RequireJS](http://requirejs.org/), [jQuery](http://jquery.com) or [HeadJS](http://headjs.com/).

To override the script loader, assign a function to `loadScripts` in `F2.init` as shown below. The function is passed `scripts` (array) and `callback` (function) which needs to be called when all scripts have been loaded.

```javascript
F2.init({
    loadScripts: function(scripts,callback){
        //perform script loading
        callback();
    }
});
```

The following example demonstrates using [HeadJS](http://headjs.com/site/api/v1.00.html#load) to load script dependencies:

```javascript
F2.init({
    loadScripts: function(scripts,callback){
        head.load(scripts, function(){
            callback();
        });
    }
});
```

<span class="label label-danger">Important</span> The `callback` function must be executed on completion of the script loading so F2 can continue registering apps.

#### Override the Stylesheet Loader

As defined in the `AppManifest`, each F2 App can have stylesheet file dependencies. These are [defined as URLs](app-development.html#app-manifest) in the `AppManifest.styles` property. The stylesheet loader can be replaced with any stylesheet loading mechanism such as those found in [HeadJS](http://headjs.com/) or [LazyLoad](https://github.com/rgrove/lazyload).

To override the stylesheet loader, assign a function to `loadStyles` in `F2.init` as shown below. The function is passed `styles` (array) and `callback` (function) which needs to be called when all stylesheets have been loaded.

```javascript
F2.init({
    loadStyles: function(styles,callback){
        //perform stylesheet loading
        callback();
    }
});
```

The following example demonstrates using [HeadJS](http://headjs.com/site/api/v1.00.html#load) to load stylesheet dependencies:

```javascript
F2.init({
    loadStyles: function(styles,callback){
        head.load(styles, function(){
            callback();
        });
    }
});
```

<span class="label label-danger">Important</span> The `callback` function must be executed on completion of the stylesheet loading so F2 can continue registering apps.

#### Override the Inline Script Loader

As defined in the `AppManifest`, each F2 App can have inline script dependencies. These are [defined as strings](app-development.html#app-manifest) in the `AppManifest.inlineScripts` property (type array). The inline script evaluator can be replaced with any script evaluator, however, it is expected Container Developers will not require an alternative to the `eval` currently in use.

To override the inline script evaluator, assign a function to `loadInlineScripts` in `F2.init` as shown below. The function is passed `inlines` (array) and `callback` (function) which needs to be called when all inline scripts have been evaluated.

```javascript
F2.init({
    loadInlineScripts: function(inlines,callback){
        //perform inline script evaluation
        callback();
    }
});
```

<span class="label label-danger">Important</span> The `callback` function must be executed on completion of the script loading so F2 can continue registering apps.

<span class="label label-info">Note</span> This Container Config option was added not because it is expected Container Developers will need or use it but rather to prevent unnecessary scripting in the [script override config option](#override-the-request-for-app-dependencies).

### Handling Script Errors

In the event any scripts defined in an `AppManifest` fail to load&mdash;such as HTTP 404 or simply timeout after the [configurable](./sdk/classes/F2.ContainerConfig.html#properties-scriptErrorTimeout) 7 seconds&mdash;F2 Events are triggered. The two events are: `RESOURCE_FAILED_TO_LOAD` and the `APP_SCRIPT_LOAD_FAILED` [AppHandler](./sdk/classes/F2.Constants.AppHandlers.html#properties-APP_SCRIPT_LOAD_FAILED). Both events are passed the `appId` and `src` of the failed script. 

```javascript
F2.Events.on('RESOURCE_FAILED_TO_LOAD', function(data){
    F2.log('Script failed to load: ' data.src); 
    //Ouputs 'Script failed to load: http://cdn.com/script.js'
});
```

### When Are Scripts Loaded? 

When all of the scripts defined in an `AppManifest` have been loaded, the `APP_SCRIPTS_LOADED` event is triggered. This event receives the `appId` and array of `scripts` just loaded. _This event is fired for every App registered._

```javascript
F2.Events.on('APP_SCRIPTS_LOADED', function(data){
    F2.log('All scripts for ' +data.appId+ ' have been loaded.');
    //Ouputs 'All scripts for com_test_app have been loaded.'
});
```

### Supported Views

F2 Container Developers should define which [app views](app-development.html#f2.ui.views) their container supports. This is set in the `supportedViews` property of the `ContainerConfig` using [`F2.Constants.Views`](./sdk/classes/F2.Constants.Views.html).

```javascript
F2.init({
    supportedViews: [F2.Constants.Views.HOME, F2.Constants.Views.SETTINGS, F2.Constants.Views.REMOVE]
});
```

<span class="label label-info">Note</span> Every F2 app has a `home` view (whether defined by the App Developer or not). This means if no views are provided by the App Developer, a `home` view is automatically added to `appConfig.views` during the app registration process inside F2.

### Secure Apps

For information about how to configure secure apps (i.e., load 3rd party apps in an isolated `iframe`) on a container, [read about Secure Apps](#secure-apps).

### Container Templates

If you're looking for sample container HTML template code, jump to the [Get Started section](#get-started).

* * * *

## App Integration

There are two ways of integrating apps on a container: [requesting apps on-demand](#requesting-apps-on-demand) (via HTTP) or by [linking pre-loaded apps](#registering-pre-loaded-apps). Requesting apps on-demand when the container loads is the traditional way of integrating apps with F2. Incorporating apps which have been pre-fetched or are otherwise already on the container when it loads is an alternative method. The following sections describe both of these methods in detail.

The process of loading apps on a container occurs by using a method called `F2.registerApps()`. The Container Developer must call [this method](./sdk/classes/F2.html)&mdash;which accepts two arguments: one required, one optional&mdash; after `F2.init()` is called. If this method isn't called, no apps can be loaded on the container.

The two arguments provided to `registerApps()` are an array of `AppConfig` objects and, optionally, an array of `AppManifest` objects. As F2.js parses each `AppConfig`, the apps are validated, hydrated with some additional properties, and saved in browser memory on the container. Regardless of where the container's `AppConfig` object is defined (hard-coded or via API), integrating apps is a simple process. 

### AppConfigs

Before continuing, let's discuss the `AppConfig`. The container-provided app configurations are represented simply as an array of [AppConfig objects](./sdk/classes/F2.AppConfig.html). These could be configured statically or fetched from an F2 Registry API. `AppConfig` objects contain app meta data&mdash;including the `manifestUrl`&mdash;provided by the App Developer when an app is registered in the [Developer Center](about-f2.html#developer-center). 

An example `AppConfig` object from an _individual_ app:

```javascript
{
    appId: "com_companyName_appName",
    manifestUrl: "http://www.domain.com/manifest.js",
    name: "App name",
    context: {
        data: [1,2,3,4,5]
    }
}
```

An example array of `AppConfig` objects for a collection of apps:

```javascript
[
    {
        appId: "com_companyName_appName",
        manifestUrl: "http://www.domain.com/manifest.js",
        name: "App name",
        context: {
            data: [1,2,3,4,5]
        }
    },
    {
        appId: "com_companyName_appName2",
        manifestUrl: "http://www.domain.com/manifest2.js",
        name: "App2 name",
        context: {
            name: 'value'
        }
    },
    {
        appId: "com_companyName_appName3",
        manifestUrl: "http://www.domain.com/manifest3.js",
        name: "App3 name",
        context: {
            status: 'ok'
        }
    },
];
```

### Page Load Life Cycle 

When the Container (or, more simply, the web page) loads F2 apps via `F2.registerApps`, a series of `F2.AppHandler` events are fired. Their order of execution is detailed [in the SDK docs](./sdk/classes/F2.AppHandlers.html). An important part of this order of execution&mdash;inside step #4 under 'App Rendering'&mdash;is how each app's dependencies are loaded and added to the page. As detailed in [the `AppManifest` docs](app-development.html#app-manifest), the `scripts` and `styles` arrays can include any dependencies which add style or functionality to an app.

During the F2 app load life cycle, the following events happen in order:

1. `F2.registerApps` called, each `AppConfig` iterated over
2. Every `AppConfig` receives an `instanceId` property (with a value of a UUID)
3. Every `AppConfig` is validated (`appId` and `manifestUrl` properties must exist)
4. If the `AppConfig` contains a `root` property, F2 switches to [preloading mode](#registering-pre-loaded-apps)
5. If the `AppConfig` contains the `enableBatchRequests:true` property, F2 switches to [batching mode](#batch-requesting-apps)
6. Finally, the [internal `_loadApps` function](https://github.com/OpenF2/F2/blob/master/sdk/src/container.js#L211) is called which:
  1. Iterates over each URL in the `styles` array, creates a new `<link rel="stylesheet">` tag and inserts it into the `<head>`.
  2. Iterates over each app in the `apps` array, stores off any `data` to pass to the `appclass` later, and inserts any HTML into the app's root.
  3. Iterates over each URL in the `scripts` array, creates a new `<script>` tag and attaches it to the `<body>`. The scripts are _requested and added in serial_ to ensure they execute in order.
  4. Iterates over each string in the `inlineScripts` array, and evaluates the script&mdash;only when all of the scripts in the previous step have been loaded.
  5. When this process is complete and _all dependencies have been loaded_, a new app instance is created and [the `appclass` is initialized](app-development.html#app-class).

<span class="label label-danger">Important</span> Since version 1.4.0, regardless of how many times a particular app is loaded, each of its `scripts` and `styles` dependencies is requested and inserted into the page **only once**.

### Auto-Loading Apps

Since version 1.4.0, App Placeholders provide a way to greatly simplify F2 App integration. This newer declarative style allows Container Developers to add F2.js and minimal HTML (with data attributes) to a web page, F2 will then automatically find and register the App associated to the HTML. 

By using one of the available attributes (`f2-autoload`), F2 auto-registers this "Hello World" App and inserts it into this "placeholder" DOM element.

```html
<div id="f2-autoload" data-f2-appid="com_openf2_examples_nodejs_helloworld" data-f2-manifesturl="http://www.openf2.org/F2/apps"></div>
```

#### Supported Auto-Load Attributes

The following HTML elements are automatically parsed by F2.js and will trigger auto-loading (provided requirements below are met):

* CSS classname: `.f2-autoload`
* Data attribute: `[data-f2-autoload]`
* ID attribute: `#f2-autoload`

#### Requirements

Both an `appId` and `manifestUrl` are required for F2.js to successfully register an App. Use `data-f2-appid` and `data-f2-manifesturl` as shown in this example:

```html
<div id="f2-autoload" data-f2-appid="com_openf2_examples_nodejs_helloworld" data-f2-manifesturl="http://www.openf2.org/F2/apps"></div>
```

#### Other Options

F2 Context can be provided for auto-loaded Apps. Use the `data-f2-context` data attribute and assign stringified JSON as the value.

```html
data-f2-context="{&quot;hello&quot;:&quot;world&quot;}"
```

Implemented:

```html
<div id="f2-autoload" data-f2-appid="com_openf2_examples_nodejs_helloworld" data-f2-manifesturl="http://www.openf2.org/F2/apps" data-f2-context="{&quot;hello&quot;:&quot;world&quot;}"></div>
```

[Batch requesting](#batch-requesting-apps) of Apps as well as [secure Apps](app-development.html#secure-apps) are supported in the auto-loading mode.

* To enable an App as secure, use the `data-f2-issecure` data attribute.
* To enable batch requests, use the `data-f2-enablebatchrequests` data attribute.

<span class="label label-info">Note</span> More `AppConfig` properties could be added as data attributes for auto-loading in future versions. See [#187](https://github.com/OpenF2/F2/issues/187).

<span class="label label-info">Note</span> The `ContainerConfig` cannot be customized when auto-loading apps. See [#186](https://github.com/OpenF2/F2/issues/186).

### Requesting Apps On-Demand

Requesting apps on-demand when the container loads is the traditional way of integrating apps with F2. For the purposes of this example, we will use an example news app from [OpenF2.org](http://www.openf2.org/Examples). 

Let's look at some container code.

#### Static App Configuration

First, we define the `AppConfig` in a _hard-coded_ `_appConfig` variable. This example demonstrates only a single app; if there were multiple apps, `_appConfig` would be an array of objects versus an object literal. Secondly, when the document is ready, `F2.init()` is called and subsequently `F2.registerApps()` with the single argument.

<iframe width="100%" height="350" src="http://jsfiddle.net/OpenF2js/eBqmn/embedded/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

This javascript code will insert the example news app into the container's `<body>`. Press **Result** in the jsfiddle above to try this demo. 

<span class="label label-info">Note</span> If more granular control is needed for app placement, use `F2.AppHandlers` functionality. Read about that in [AppHandlers for App Layout](#apphandlers-for-app-layout).

#### Dynamic App Configuration

As an alternative to static app configuration shown above, the `_appConfig` variable could be assigned the result of an API call to the [F2 Registry](about-f2.html#the-store). The Registry API response is designed to match the structure of the `AppConfig` for passing the JSON straight through to F2 in your code. Whether your app configuration JSON comes from the F2 Registry or your own database is irrelevant; the process is identically the same as shown in this example.

<iframe width="100%" height="800" src="http://jsfiddle.net/OpenF2js/bKQ96/15/embedded/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

<span class="label label-info">About this jsfiddle</span> To simulate an ajax request, this example uses jsfiddle's [echo feature](http://doc.jsfiddle.net/use/echo.html). Simply replace the `getAppConfigs` function with your own ajax request and ignore the `echoData` variable.

### Batch Requesting Apps

F2 supports batch requesting of multiple apps hosted on the same domain. The default app registration process sends a single outbound HTTP request for _each app_ registered with F2. For example, when registering five apps, five HTTP requests would be made for each app's `AppManifest`. Implementing the same five apps using a batch request would result in only a single HTTP request thus greatly speeding up page performance.

Implementing F2 container code for apps to be requested in a batch is as simple as setting the `AppConfig.enableBatchRequests` property to `true`. The only additional requirement is that the apps to-be-batched must have the same `AppConfig.manifestUrl` value. That is, **the batched apps must be on the same domain**.

#### Example

<iframe width="100%" height="450" src="http://jsfiddle.net/OpenF2js/mETUY/embedded/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

Open your browser developer tools to see the single HTTP request to `http://www.openf2.org/Examples/Apps`. You could modify this jsFiddle and set _one_ of the AppConfig `enableBatchRequests` to `false`. Then re-run the code to see _two_ HTTP requests sent in your developer tools. 

<div class="alert alert-block alert-warning">
    <h4>Important</h4>
    The <code>params</code> querystring value for both batch-requested and non-batch-requested apps is a <a href="#container-to-app-context-server">serialized collection of AppConfigs</a>. In a scenario when many apps are batch-requested it would be possible to quickly reach the maximum HTTP GET character limit. In <a href="http://www.boutell.com/newfaq/misc/urllength.html">IE that limit is 2048 characters</a>, it is longer in more modern browsers. To work around this issue, F2 recommends either configuring <a href="#override-the-appmanifest-request">HTTP POST</a> if the container and apps are on the same domain or by <a href="http://enable-cors.org/">implementing CORS</a>.
</div>

<span class="label label-info">Note</span> For more information about the `AppConfig`, [read up on them](#appconfigs) at the top of [App Integration](#app-integration).

### Registering Pre-Loaded Apps

Incorporating apps which have been pre-loaded or are otherwise already on the container when it loads is an alternative method to integrating F2 apps. This method is useful when the container is being constructed on the server-side (at run-time or on a schedule) and F2 functionality is desired. To use pre-loaded apps, the Container Developer is required to make a request to each app's `AppManifest` and its dependencies _before_ the page is rendered.

For the following example, let's assume you have a web page composed on the server and all of its HTML is delivered to the browser in one payload. This page also has at least one widget (or component) you'd like to register with F2.js. 

#### 1. Setup Container

To use pre-loaded apps, a web page with a placeholder element for the apps is required. This simple (and empty) web page features a `div#news_app.col-md-12` which serves as that placeholder or "root" element.

```html
<!DOCTYPE html>
    <head>
        <title>F2 Container</title>
        <link rel="stylesheet" href="/path/to/your/bootstrap.css">
    </head>
    <body>
        <div class="container">
            <div class="row">
                <div class="col-md-12" id="news_app">
                    <!--app goes here-->
                </div>
            </div>
        </div>
        <script src="/path/to/your/F2.js"></script>
    </body>
</html>
```

#### 2. Request AppManifest

Next, make a server-side request to the news app's `AppManifest`&mdash;the URL is found in `manifestUrl`&mdash;and capture the resulting JSON. Each `AppManifest` contains scripts, style sheets and HTML ([more about the `AppManifest`](app-development.html#app-manifest)). The market news app's `AppManifest` looks like this:

```javascript
{
   "apps":[{
         "data":{},
         "html": "<div data-module-name=\"MarketNewsApp\">...</div>",
    }],
   "scripts":[
      "http://www.openf2.org/js/main.js"
   ],
   "styles":[
      "http://www.openf2.org/css/site.css"
   ]
}
```

<span class="label label-info">Note</span> Parts of this `AppManifest` were intentionally removed for legibility, including the required JSONP function name (`F2_jsonpCallback_com_openf2_examples_csharp_marketnews`). The full `AppManifest` is [available on OpenF2.org](http://www.openf2.org/Examples/Apps?params=%5B%7B%22appId%22%3A%22com_openf2_examples_csharp_marketnews%22%7D%5D).

<div class="alert alert-block alert-info">
    <h5>Performance Tip</h5>
    Container Developers can use the `AppConfig` and pre-loaded `AppManifest` (from step 2 above) in conjunction with `F2.registerApps()` to speed up the loading of F2 containers. For more information, browse to [Combining AppConfig and AppManifest](#combining-appconfig-and-appmanifest).
</div>

#### 3. Add App to Container

You're almost there. Next, embed the news app's `html`, `scripts` and `styles`. The F2 app is inserted into `.row > .col-md-12` following [Bootstrap's scaffolding](http://getbootstrap.com/css/#grid) guidelines. The `styles` were appended to the `head` and the `scripts` were appended to the `body` (in this case just one URL for each).

```html
<!DOCTYPE html>
    <head>
        <title>F2 Container</title>
        <link rel="stylesheet" href="/path/to/your/bootstrap.css">
        <link rel="stylesheet" href="http://www.openf2.org/css/site.css">
    </head>
    <body>
        <div class="container">
            <div class="row">
                <div class="col-md-12" id="news_app">
                    <div data-module-name="MarketNewsApp" id="news_app">...</div>
                </div>
            </div>
        </div>
        <script src="/path/to/your/F2.js"></script>
        <script src="http://www.openf2.org/js/main.js"></script>
    </body>
</html>
```

The example news app is now part of the web page and everything should be functioning properly. **The final step is to register the app with F2**.

#### 4. Assign Root Element to AppConfig

To use pre-loaded apps, an additional property is required on the `AppConfig` object. It is called `root` and can be either a CSS selector string _or_ a DOM element. Regardless of type, F2 will parse the value of `root` and it must return an existing in-page DOM element. Furthermore, the value of `root` must represent a _unique_ DOM element as each app needs its own containing, or `root`, element.

```javascript
var _appConfig = {
    appId: 'com_openf2_examples_csharp_marketnews',
    description: 'Example News',
    manifestUrl: 'http://www.openf2.org/Examples/Apps',
    name: 'Example News',
    root: document.getElementById('news_app')
};
```

Both of these are valid values for the `root` property. 

Using JavaScript:

```javascript
{
    root: document.getElementById('news_app')
}
```

Using a CSS selector string:

```javascript
{
    root: '#news_app'
}
```

F2.js uses jQuery internally to parse the value of the `root` property and, in turn, jQuery relies on the [Sizzle javascript selector library](http://sizzlejs.com/). If a CSS selector string is assigned to `root`, it must be a valid CSS 3 selector supported by Sizzle. Refer to the [Sizzle documentation for more details](https://github.com/jquery/sizzle/wiki/Sizzle-Documentation).

#### 5. Register App

Since you started with the `AppConfig` and now have the `AppManifest` from step 2 along with an HTML page containing the embedded app, all that remains is a simple call to F2. Registering pre-loaded apps with F2.js means passing the ammended `AppConfig` as shown in the example below. 

```javascript
var _appConfig = {
    appId: 'com_openf2_examples_csharp_marketnews',
    description: 'Example News',
    manifestUrl: 'http://www.openf2.org/Examples/Apps',
    name: 'Example News',
    root: document.getElementById('news_app')
};

$(function(){
    F2.init();
    F2.registerApps(_appConfig);
});
```

The web page and pre-loaded news app is a fully F2-enabled container. Rejoice!

### Combining AppConfig and AppManifest

Container Developers can use the `AppConfig` and pre-loaded `AppManifest` (from [step 2 above](#request-appmanifest)) in conjunction with `F2.registerApps()` to speed up the loading of F2 containers. The [`F2.registerApps()` API supports](./sdk/classes/F2.html#methods-registerApps) two arguments: `appConfigs` and `appManifests`. The former is an array of [`F2.AppConfig` objects](./sdk/classes/F2.AppConfig.html) and the latter is an array of [`F2.AppManifest` objects](./sdk/classes/F2.AppManifest.html). The `appManifests` array must be the same length as the `appConfigs` array that is used as the first argument. This can be useful if apps are loaded on the server-side and passed down to the client.

In the following example, the `AppManifest` was pre-loaded and stored in the `_appManifest` variable.

```javascript
var _appConfig = {
    appId: 'com_openf2_examples_csharp_marketnews',
    description: 'Example News',
    manifestUrl: 'http://www.openf2.org/Examples/Apps',
    name: 'Example News',
    root: document.getElementById('news_app')
};

var _appManifest = {
   "apps":[{
         "data":{},
         "html": "<div data-module-name=\"MarketNewsApp\">...</div>",
    }],
   "scripts":[
      "http://www.openf2.org/js/main.js"
   ],
   "styles":[
      "http://www.openf2.org/css/site.css"
   ]
};

$(function(){
    F2.init();
    F2.registerApps(_appConfig,_appManifest);
});
```

If a manifest is passed with the `AppConfig`, then the `AppClass` will receive an index from the manifest's `apps` property in place of `AppContent`. If no manifest is supplied, the `AppClass` will receive the following hardcoded `AppContent`:

```
{
    preloaded: true,
    status: 'SUCCESS'
}
```

<span class="label label-danger">Important</span> The `F2.registerApps()` API supports both an array of objects and object literals for each argument. Internally, F2.js converts the value of each argument into an array using concatenation (`[].concat()`). If arrays of objects are used (when there are more than one app on the container), the `_appConfig` and `_appManifest` arrays must be of equal length, and the object at each index must be a parallel reference. This means the `AppConfig` and `AppManifest` for the sample news app used above must be in `_appConfig[0]` and `_appManifest[0]`.

* * * *

## AppHandlers for App Layout

New functionality called `F2.AppHandlers` was added in F2 1.2, and the conversation about this collection of features occurred in [#38](https://github.com/OpenF2/F2/issues/38) on GitHub. The new `AppHandlers` functionality provides Container Developers a higher level of control over configuring app rendering and interaction. 

<p class="alert alert-block alert-warning">
The addition of `F2.AppHandlers` replaces the previous `ContainerConfig` properties `beforeAppRender`, `appRender`, and `afterAppRender`. These methods were deprecated&mdash;but not removed&mdash;in version 1.2. They will be permanently removed in a future version of F2.
</p>

<p class="alert alert-block alert-info">
Since F2 version 1.2, `AppHandlers` is the preferred method for Container Developers to manage app layout.
</p>

The `AppHandlers` functionality provides an event-based system for Container Developers' web applications. The addition of a collection of constants in `F2.Constants.AppHandlers` shows the primitive set of event types (or hooks) available to developers, including hooks such as `appCreateRoot`, `appRenderAfter`, `appDestroyAfter` and more. (Review the complete `F2.Constants.AppHandlers` collection in [the F2.js SDK documentation](./sdk/classes/F2.Constants.AppHandlers.html).)

Using `AppHandlers` is as simple as attaching an event handler function to be executed at the appropriate time as determined by the order of operations in F2. To do this there are three functions available on `F2.AppHandlers`: `getToken`, `on`, and `off`. We'll review the token concept first as a token is the required first argument in `on` and `off`. 

### AppHandler Tokens

A new feature has been added to F2 as part of `AppHandlers`: the event token. The token is designed to be used only by Container Developers to ensure the `AppHandlers` listeners are only called by their applications, and aren't accessible to App Developers' code. Container Developers should create a variable for this token in their JavaScript and encapsulate it inside a closure as shown in the example below.

```javascript
(function(){
    var token = F2.AppHandlers.getToken(); 
    console.log(token);
    //outputs a GUID like 'ce2e7aae-04fa-96a3-edd7-be67e99937b4'
});
```

<span class="label label-danger">Important</span> The `getToken()` function can only be called one-time. It self-destructs to protect the token for Container Developers and therefore Container Developers must call `F2.AppHandlers.getToken()` and store its return value before any F2 apps are registered with the container.

### Default App Layout

In the unlikely event a Container Developer wishes to append all apps to the `<body>` element, no configuration is required. Simply add this code to the container:

```javascript
F2.init();
F2.registerApps(appConfig);
```

Appending apps to the `<body>` is the default app rendering behavior of F2.

### Custom App Layout

F2 `AppHandlers` provide event handlers for customized app layout using `F2.AppHandlers.on()` and `F2.AppHandlers.off()`. The use of `on` and `off` require both a [token](#apphandler-tokens) and an event type as arguments. The event types, defined as constants in `F2.Constants.AppHandlers`, are: 

* `appCreateRoot`
* `appDestroy`
* `appDestroyAfter`
* `appDestroyBefore`
* `appRender`
* `appRenderAfter`
* `appRenderBefore` 

Review the complete `F2.Constants.AppHandlers` collection and their purpose in [the F2.js SDK documentation](./sdk/classes/F2.Constants.AppHandlers.html). The order of operations is detailed in [F2.AppHandlers](./sdk/classes/F2.AppHandlers.html).


#### Appending an App to a DOM Element

There are many uses for `AppHandlers` in Container Developers' applications and they are detailed&mdash;including plenty of examples&mdash;in the [F2.js SDK documentation](./sdk/classes/F2.AppHandlers.html). Before jumping to that section of the docs, let's look at one of the more common uses for `AppHandlers`: targeting the placement of an app into a specific DOM element.

In the following example, the app will be appended to the `#my_sidebar` DOM element on the container.

```javascript
var _token = F2.AppHandlers.getToken(),
    _appConfig = {
        appId: 'com_example_app',
        manifestUrl: '/manifest.js'
    };

F2.init();
F2.AppHandlers.on(_token, 'appRender', document.getElementById('my_sidebar'));
F2.registerApps(_appConfig);
```

F2 will insert `html` from the `AppManifest` inside the specified DOM element. The resulting HTML will look like this after `registerApps` is called. Take note F2.js adds three class names to the app's outermost element (`f2-app`, `f2-app-container`, and `com_example_app` for the `appId`).

```html
<div id="my_sidebar">
    <!--HTML defined in AppManifest inserted here-->
    <div class="f2-app f2-app-container com_example_app">
        <div class="f2-app-view" data-f2-view="home">
            <p>Hello World!</p>
        </div>
    </div>
</div>
```

<span class="label label-info">Note</span> The original `html` in this example app manifest is [available here](http://docs.openf2.org/demos/apps/JavaScript/HelloWorld/manifest.js).

The jsfiddle below demonstrates a Hello World example using the `appRender` event type and a DOM element as the third argument in `on`.

<iframe width="100%" height="400" src="http://jsfiddle.net/OpenF2js/SGKa3/embedded/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

#### Placing Apps in Separate Locations

Here is a slightly more complicated example of the `appRender` event coupled with `appCreateRoot` to place two apps in two separate DOM elements.

<iframe width="100%" height="750" src="http://jsfiddle.net/OpenF2js/3gZJu/embedded/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

#### More AppHandlers

There are numerous examples shown on the Properties tab of [`F2.Constants.AppHandlers`](./sdk/classes/F2.Constants.AppHandlers.html). These demonstrate more advanced use of `F2.AppHandlers` and aim to provide Container Developers demonstrable low-level control over the [life cycle of app rendering](#page-load-life-cycle).

* * * *

## Namespacing

F2 is a _web_ integration framework which means apps are inherently insecure&mdash;at least those _non-secure_ apps. Following this spec, App Developers must avoid CSS collisions and JavaScript namespace issues to provide users with the best possible experience.

<span class="label label-default">Note</span> Continue reading for [more specifics about secure apps](#secure-apps).

### Namespacing CSS

As discussed in [Developing F2 Containers: F2 ContainerID](#f2-containerid), to develop an F2 container, you need a unique identifier called an ContainerID. This ContainerID will be unique to your container across the entire open financial framework ecosystem. The format of the ContainerID looks like this: `com_container_companyName_containerName`, where the `companyName` "namespace" is your company name and `containerName` is the name of your container.

To avoid styling conflicts or other display issues related to injecting app-provided style sheets into your container when `F2.registerApps()` is called, App Developers [must namespace their CSS selectors](app-development.html#namespacing-css). **While there are strict rules for App Developers, the same is true for Container Developers**. This is especially true when nesting multiple F2 apps inside an existing container where that container already has a CSS framework in place. (This is often called the "mutliple container" issue, and a conversation about existing problems and enhancements to F2.js is being discussed in [#37](https://github.com/OpenF2/F2/issues/37) and [#38](https://github.com/OpenF2/F2/issues/38).)

In the event there are multiple containers, every CSS selector in container-provided style sheets must be properly namespaced. The [CSS files bundled with the example containers in the F2 project on GitHub](https://github.com/OpenF2/F2/tree/master/examples/container/css) demonstrate this concept, and we have included a [readme](https://github.com/OpenF2/F2/blob/master/examples/container/css/README.md) for how to use a LESS compiler to automate the namespacing of Bootstrap's CSS.

In this simple example, container-provided CSS should be namespaced as shown below.

```css
.com_container_companyName_containerName p {
    padding:5px;
}

.com_container_companyName_containerName .alert {
    color:red;
}
```

Note `.com_container_companyName_containerName` is prefixed on both `p` and `.alert` selectors.

While the [CSS cascade](http://www.webdesignfromscratch.com/html-css/css-inheritance-cascade/) will assign more points to IDs and while prefixing F2 ContainerIDs on CSS selectors isn't required, it is recommended.

```css
.com_container_companyName_containerName #notice {
    background-color:yellow;
}
```

#### About CSS Resets

It is a common web development practice to use [CSS resets](http://meyerweb.com/eric/tools/css/reset/), and it is likely both Container and App Developers will use them. Since there are many ways to normalize built-in browser stylesheets, including [Normalize.css](http://necolas.github.com/normalize.css/) which is used by Bootstrap, Container and App Developers must namespace their CSS reset selectors.

### Keeping JavaScript Clean

Adhering to one of the [OpenAjax Alliance](http://www.openajax.org/) goals, F2 also promotes the concept of an uncluttered global javascript namespace. For Container and App Developers alike, this means following this spec closely and ensuring javascript code is contained inside [closures](http://jibbering.com/faq/notes/closures/) or is extended as a new namespace on `F2`.

The F2.js SDK was designed with extensibility in mind and therefore custom logic can be added on the `F2` namespace.

Example:

```javascript
F2.extend('YourPluginName', (function(){
    return {
        doSomething: function(){
            F2.log("Something has been done.");
        }
    };
})());
```

For more information, read [Extending F2](extending-f2.html).

* * * *

## Context

Apps are capable of sharing "context" with the container and other nearby apps. All apps have context which means the app "knows" who is using it and the content it contains. It is aware of an individual's data entitlements and user information that the container is requested to share (name, email, company, etc).  

This means if a user wants to create a ticker-focused container so they can keep a close eye on shares of Proctor & Gamble, the container can send "symbol context" to any listening apps that are smart enough to refresh when ticker symbol PG is entered in the container's search box.

While apps can have context themselves, the responsibility for managing context switching or context passing falls on the container. The container assumes the role of a traffic cop—managing which data goes where. By using JavaScript events, the container can listen for events sent by apps and likewise apps can listen for events sent by the container. To provide a layer of security, this means apps cannot communicate directly with other apps on their own; apps must communicate via an F2 container to other apps since the container controls the [F2.Events API](../docs/sdk/classes/F2.Events.html).

[Read more in the Framework](about-f2.html#framework).

### How to use Context

Each container will be responsible for hosting the [F2.js JavaScript SDK](f2js-sdk.html). The F2 SDK not only provides the consistent mechanism app developers have come to expect for loading their apps on the container, but also contains an [event API](./sdk/classes/F2.Events.html) for handling context.

<span class="label label-danger">Important</span> It is important to note that while apps can have context themselves, the responsibility for managing context switching or context passing falls on the container. The container assumes the role of a traffic cop&mdash;managing which data goes where. By using JavaScript events, the container can listen for events sent by apps and likewise apps can listen for events sent by the container. This means **apps cannot communicate directly with other apps on their own**; apps communicate via the container to other apps since the container controls the `F2.Events` API.

Let's look at some code.

### Container-to-App Context

In this example, the container broadcasts, or emits, a javascript event defined in `F2.Events.Constants`. The `F2.Events.emit()` method accepts two arguments: the event name and an optional data object.

```javascript
F2.Events.emit(
    F2.Constants.Events.CONTAINER_SYMBOL_CHANGE, 
    { 
        symbol: "AAPL", 
        name: "Apple, Inc." 
    }
);
```

To listen to the `F2.Constants.Events.CONTAINER_SYMBOL_CHANGE` event inside your F2 app, you can use this code to trigger an alert dialog with the symbol:

```javascript
F2.Events.on(
    F2.Constants.Events.CONTAINER_SYMBOL_CHANGE, 
    function(data){
        F2.log("The symbol was changed to " + data.symbol);
    }
);
```

The `F2.Events.on()` method accepts the event name and listener function as arguments. [Read the SDK](./sdk/classes/F2.Events.html) for more information.

<span class="label label-default">Note</span> For a full list of support event types, browse to the SDK for [F2.Constants.Events](./sdk/classes/F2.Constants.Events.html).

### Container-to-App Context (Server)

Often times containers will want to send context to apps during [app registration](./sdk/classes/F2.html#methods-registerApps). This is possible through the `AppConfig.context` property. This [property](./sdk/classes/F2.AppConfig.html#properties-context) can contain any javascript object&mdash;a string, a number, an array or an object. 

```javascript
//define app config
var _appConfigs = [
    {
        appId: "com_acmecorp_news",
        description: "Acme Corp News",
        manifestUrl: "http://www.acme.com/apps/news-manifest.js",
        name: "Acme News App",
        context: {
            sessionId: myApp.sessionId,
            someArray: [value1,value2]
        }
    }
];
```

When `F2.registerApps()` is called, the `appConfig` is serialized and posted to the app's manifest URL. The serialized object converts to [stringified JSON](./sdk/classes/F2.html#methods-stringify):

```javascript
{"appId":"com_acmecorp_news","description":"Acme Corp News","manifestUrl":"http://www.acme.com/apps/news-manifest.js","name":"Acme News App","context":{"sessionId":"12345", "someArray":["value1","value2"]}}
```

The `appConfig` object is sent to the server using the `params` querystring name as shown in the example below. This is the complete app manifest request sent by `F2.registerApps()` with the `appConfig` URL-encoded, of course:

```html
http://www.acme.com/apps/news-manifest.js?params=%7B%22appId%22%3A%22com_acmecorp_news%22%2C%22description%22%3A%22Acme%20Corp%20News%22%2C%22manifestUrl%22%3A%22http%3A%2F%2Fwww.acme.com%2Fapps%2Fnews-manifest.js%22%2C%22name%22%3A%22Acme%20News%20App%22%2C%22context%22%3A%7B%22sessionId%22%3A%2212345%22%2C%20%22someArray%22%3A%5B%22value1%22%2C%22value2%22%5D%7D%7D
```

This demonstrates complete flexibility of passing arbitrary context values from the container to any F2 app.

### App-to-Container Context

In this example, your app emits an event indicating a user is looking at a different stock ticker _within your app_. Using `F2.Events.emit()` in your code, your app broadcasts the new symbol. As with container-to-app context passing, the `F2.Events.emit()` method accepts two arguments: the event name and an optional data object.

```javascript
F2.Events.emit(
    F2.Constants.Events.APP_SYMBOL_CHANGE, 
    { 
        symbol: "MSFT", 
        name: "Microsoft, Inc." 
    }
);
```

The container would need to listen to your app's broadcasted `F2.Constants.Events.APP_SYMBOL_CHANGE` event using code like this:

```javascript
F2.Events.on(
    F2.Constants.Events.APP_SYMBOL_CHANGE, 
    function(data){
        F2.log("The symbol was changed to " + data.symbol);
    }
);
```

<span class="label label-default">Note</span> For a full list of support event types, browse to the SDK for [F2.Constants.Events](./sdk/classes/F2.Constants.Events.html).

### App-to-App Context

Apps can also pass context between apps. If there are two or more apps on a container with similar context and the ability to receive messages (yes, through event listeners, context receiving is opt-in), apps can communicate with each other. To communicate with another app, each app will have to know the event name along with the type of data being passed. Let's take a look.

Within "App 1", context is _sent_ using `F2.Events.emit()`:

```javascript
F2.Events.emit(
    "buy_stock", //custom event name
    { 
        symbol: "GOOG", 
        name: "Google Inc",
        price: 682.68,
        isAvailableToPurchase: true,
        orderType: "Market Order"
    }
);
```

Within "App 2", context is _received_ using `F2.Events.on()`:

```javascript
F2.Events.on(
    "buy_stock", 
    function(data){
        if (data.isAvailableToPurchase){
            F2.log("Trade ticket order for " + data.symbol + " at $" + data.price);
        } else {
            F2.log("This stock is not available for purchase.")
        }
    }
);
```

### More Complex Context 

The examples above demonstrate _simple_ Context objects. In the event more complex data and/or data types are needed, F2 Context can support any JavaScript object&mdash;a string, a number, a function, an array or an object. 

This is an example Context object demonstrating arbitrary JavaScript objects:

```javascript
F2.Events.emit(
    "example_event", //custom event name
    { 
        //number
        price: 100,
        //string
        name: 'John Smith',
        //function
        callback: function(){
            F2.log('Callback!');
        },
        //array
        watchlist: ['AAPL','MSFT','GE'],
        //object
        userInfo: {
            name: 'John Smith',
            title: 'Managing Director',
            groups: ['Alpha','Beta'],
            sessionId: 1234567890
        }
    }
);
```

If two apps want to communicate data for populating a trade ticket _and_ execute a `callback`, [appclass.js](#scripts-1) code might look like this:

```javascript
F2.Events.emit(
    "buy_stock", //custom event name
    { 
        symbol: "GOOG", 
        name: "Google Inc",
        price: 682.68,
        isAvailableToPurchase: true,
        orderType: "Market Order",
        //define callback
        callback: function(data){
            alert('Trade ticket populated');
        }
    }
);
```

The F2 app listening for the `buy_stock` event would fire the `callback` function.

```javascript
F2.Events.on(
    "buy_stock", 
    function(data){
        F2.log("Trade ticket order for " + data.symbol + " at $" + data.price);
        //..populate the trade ticket...
        //fire the callback
        if (typeof data.callback === 'function'){
            data.callback();
        }
    }
);
```

### Types of Context

Context is a term used to describe the state of an F2 container and its apps. At the same time, context is also the information passed from [Container-to-App](#container-to-app-context) or from [App-to-App](#app-to-app-context) or from [App-to-Container](#app-to-container-context). In the examples shown above, two types of context were shown: symbol and trade ticket context. It is important to realize [F2.js](f2js.html) allows client-side messaging between third parties using a collection of arbitrary name-value pairs. This provides the utmost flexibility and affords container providers the option to define context within their container.

#### Universal F2 Instrument ID

Said another way, while `{ symbol:"AAPL", name: "Apple, Inc" }` can be used to communicate symbol context, developers could also use `{ symbol: "123456789" }` to identify Apple, Inc. The latter is more likely given not all apps would programmatically understand `AAPL` but&mdash;given symbol lookup services&mdash;would understand `123456789` as the universal _F2_ identifier for Apple, Inc. It is clear Container and App Developers alike would prefer to communicate with a guaranteed-to-never-change universal ID for all instrument types across all asset classes. _Further details will be forthcoming as the F2 specification evolves._

* * * *

## Secure Apps

Security is a fundamental requirement of any F2 container and many F2 apps. With that in mind, the integration of secure apps on a container requires more attention and effort. The process of [app integration](#app-integration) remains largely the same for integrating _secure_ apps with one significant addition: a _second_ container.

To support a secured container environment, one of the [choices](about-f2.html#choices) made when writing this specification was the inclusion of an open-source cross-domain in-browser secure messaging library. For this, F2 relies on [easyXDM](https://github.com/oyvindkinsey/easyXDM). EasyXDM helps front-end developers safely work around the [Same Origin Policy](https://developer.mozilla.org/en-US/docs/Same_origin_policy_for_JavaScript) using browser-supported techniques without compromising the user experience. For all browsers, the easyXDM transport stack offers bi-directionality, reliability, queueing and sender-verification.

### Container Config

The process of [configuring an F2 container](#container-config) to be secure is identical to that of an unsecure container. As such, every container must be setup using `ContainerConfig` and the [methods available](./sdk/classes/F2.ContainerConfig.html).

In the secure container's `$(document).ready()`, add the `F2.init()`:

```javascript
$(document).ready(function(){
    F2.init({
        //define ContainerConfig properties
        appRender: function(appConfig, html){ ... },
        beforeAppRender: function(appConfig, html){ ... },
        afterAppRender: function(appConfig){ ... }
    });
});
```

For secure containers, an additional property must be set on the `ContainerConfig` within `F2.init()`. Assuiming the container is hosted at `https://www.domain.com/container`, the following config would be appropriate:

```javascript
$(document).ready(function(){
    F2.init({
        //define ContainerConfig properties
        appRender: function(appConfig, html){ ... },
        beforeAppRender: function(appConfig, html){ ... },
        afterAppRender: function(appConfig){ ... },
        secureAppPagePath: "https://secure.domain.com/container" //define secure page path
    });
});
```

This `secureAppPagePath` property allows the container to specify which page is used when loading secure apps. To guarantee security, the page **must reside on a different domain** than the parent container. 

<span class="label label-danger">Important</span> Therefore Container Developers need two containers: one non-secure (parent), one secure (child). The parent container can follow the [basic template](#basic-container-template) style and must call `F2.init()` and `F2.registerApps()` appropriately. Per the above, it must also define the `secureAppPagePath` property in its `ContainerConfig`. To see a working container, [browse to the examples in the project repo on GitHub](https://github.com/OpenF2/F2).

Since it will be loaded in an iframe and like its parent, the secure child container must also include a [copy of the F2.js SDK](f2js-sdk.html). Additionally, it must also call `F2.init()` with a unique `ContainerConfig`. 

```javascript
F2.init({
    appRender:function(appConfig, html) {
        return [
            '<div class="col-md-4">',
                html,
            '</div>'
        ].join('');
    },
    afterAppRender:function(appConfig, html) { ... },

    //now set this property to true to tell F2 this is the secure child frame.
    isSecureAppPage:true
});
```

When the parent container calls `registerApps()`, F2 looks at each `AppConfig` for the `isSecure` bool. If the property is set to `true`, F2 inserts the secure app inside an iframe and instantiates the easyXDM transport stack. To see a working _secure_ container, [browse to the examples in the project repo on GitHub](https://github.com/OpenF2/F2).

* * * *

## Utilities

The [F2.js JavaScript SDK](f2js-sdk.html) provides utility methods for Container Developers. These are available within the `F2` namespace and complete details are in the [Reference documentation](./sdk/classes/F2.html).

* * * *

## F2 UI

There are some utility methods provided within F2.js in the `UI` namespace. These helpers are for controlling layout, showing (or hiding) loading spinners, modals, managing views within apps, and more.  To see which `UI` helpers are available to App Developers, [read about F2.UI for apps](app-development.html#f2-ui).

For Container Developers, the use of F2's `UI` is more than likely limited to customizing the design aesthetic (CSS) and [configuring the UI properties](#f2-ui-mask). 

For complete details on `F2.UI`, [browse to the SDK docs](./sdk/classes/F2.UI.html).

* * * *

## Entitlements

User or content entitlements are the responsibility of the App developer. Many apps will need to be decoupled from the content that they need. This could include apps like research aggregation, news filtering, streaming market data, etc. Similarly to how companies build their own websites today with their own authentication and access (or content) entitlements, F2 apps are no different.

_Further details around app entitlements will be forthcoming as the F2 specification evolves._

* * * *

## Single Sign-On

Single sign-on (SSO) will be a shared responsibility between the Container and App Developer. In some cases, containers will want all its apps to be authenticated seamlessly for users, and that will have to be negotiated between Container and App Developers. For the purposes of this documentation, it is assumed Container Developers will build and host authentication for access to their container(s). 

Once a user is authenticated on the container, how is the user then authenticated with all of the apps? [Encrypted URLs](#using-encrypted-urls).*

<span class="label label-default">Note</span> The Container Developer is free to utilize any app authentication method they deem fit. Container Developers and App Developers will need to work together to finalize the authentication details.

### Using Encrypted URLs

Implementing SSO using encrypted URLs is a simple and straight-forward authentication mechanism for securing cross-domain multi-provider apps. To guarantee security between the Container and App Developers, secure API contracts must be negotiated. This includes, but is not limited to, the choice of cryptographic algorithm (such as `AES`) and the exchange of public keys.

When the Container Developer calls `F2.registerApps()`, custom logic should be added to append encrypted user credentials&mdash;on a need-to-know basis&mdash;to _each app_ requiring authentication.

### Considerations

Authentication is a critical part of any container-app relationship. There are a plethora of SSO implementations and there are many considerations for both Container and App Developers alike.

_Further details around container and app single sign-on will be forthcoming as the F2 specification evolves._

* * * *
