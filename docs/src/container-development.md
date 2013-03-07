% Container Development

<p class="lead">You've come to the right place if you want to start building F2 containers. Before continuing, make sure you've [cloned the F2 repository on GitHub](https://github.com/OpenF2/F2#quick-start) or [downloaded the latest framework build](index.html#get-started) (v{{sdk.version}}). Secondly, [read about the F2 Framework](index.html#framework). There are a few important concepts to help you better understand apps, containers and context.</p>

* * * *

## Get Started

To help you get started building an F2 container, browse through the resources below. To jump start your F2 container and app development, download the F2 template (which now includes a basic container) _or_ follow the instructions below.

<p><a href="https://github.com/downloads/OpenF2/F2/Basic-F2-App-Template-1.0.4.zip" class="btn btn-primary">Download Basic F2 Container Template</a></p>

### Basic Container

To begin, you **do not need to build F2** [as described in the readme on GitHub](https://github.com/OpenF2/F2#build-f2). Simply download [Bootstrap](http://twitter.github.com/bootstrap/index.html) and save a local copy of [F2.js](f2js-sdk.html). Also ensure you're [properly configured](#configuration).

<p><a href="https://raw.github.com/OpenF2/F2/master/f2.js" class="btn">Download F2.js</a> <a href="http://twitter.github.com/bootstrap/getting-started.html#download-bootstrap" class="btn">Download Bootstrap</a></p>

Create your basic container HTML template:

```html
<!DOCTYPE html>
<html>
    <head>
        <title>F2 Container</title>
        <link rel="stylesheet" href="/path/to/your/bootstrap.css">
    </head>
    <body>
        <div class="container">
            <div class="hero-unit">
                <h1>Hello F2</h1>
            </div>
            <div class="row"><!--apps go here--></div>
        </div>
        <!--include jQuery & Bootstrap-->
        <script src="http://code.jquery.com/jquery-latest.js"></script>
        <script src="/path/to/your/bootstrap.js"></script>
        <!--include F2.js-->
        <script src="/path/to/your/F2.js"></script>
        <!--init & register-->
        <script>
            (function(){
                //define AppConfigs
                var _appConfigs = [{
                    appId: "com_your_app_id",
                    description: "F2 app description",
                    name: "F2 App",
                    manifestUrl: "/path/to/your/manifest.js" //note the path to your manifest! 
                }];
                //Setup ContainerConfig
                F2.init({
                    beforeAppRender: function(app){
                        var appRoot = '<section class="well span12"></section>';
                        return $(appRoot).appendTo('div.row');
                    },
                    afterAppRender: function (app, html) {
                        //app.root is `appRoot` from beforeAppRender()
                        return $(app.root).append(html);
                    }
                }); 
                F2.registerApps(_appConfigs); //pass _appConfigs to initialize apps
            })();
        </script>
    </body>
</html>
```

In developing a more advanced container, the HTML document's `body` element would contain additional markup and allow for specific positioning or placement of apps. Additionally, more advanced containers could introduce features and functionality to their apps in the form of authentication APIs, streaming data feeds, federated search, etc. All containers must follow the [F2 design guidelines](#container-design).

### Basic App

Create your basic [F2 app manifest](app-development.html#app-manifest) and save it as `/path/to/your/manifest.js` using this code below. Note the path to this file should be specified in the `manifestUrl` property within the `_appConfigs` array in your basic container (shown above).

```javascript
F2_jsonpCallback_com_your_app_id({
    "scripts": [],   
    "styles": [],   
    "apps": [{
        "data": {},
        "html": "<div><p>Hello, world. I'm an F2 app.</p></div>"
    }]
})
```

<span class="label">Note</span> You can [download the F2 container/app template](https://github.com/downloads/OpenF2/F2/Basic-F2-App-Template-1.0.4.zip) instead of creating the basic app by hand.

### Testing the Basics

Now with a basic container and a basic app, you can load your F2 container and expect to see:

![](./img/basic-f2-app-test.png "Basic F2 app")

In getting to this point, you've only scratched the surface of F2 containers and apps. Continue reading and understanding the F2 spec to build exactly the financial solutions that our customers want.

### Sample Apps and Container

Good news! In the [project repo on GitHub](https://github.com/OpenF2/F2/tree/master/examples/container/), you will find a basic container along with a number of sample apps which demonstrate functionality far beyond the basic app above. Once you clone or download the project repository, open the sample container by pointing your browser at:

`http://localhost/F2/examples/container/`

### Configuration

It is assumed you will be developing an F2 container locally and have a `localhost` setup. The URLs mentioned in this specification also assume you have configured your F2 container to run at `http://localhost/F2/`. The examples provided as part of the project repository demonstrate apps written in different languages (PHP, JavaScript, C#). While it is not a requirement you have a web server configured on your computer, it will certainly allow you to more deeply explore the sample apps.

To better understand F2 and the role of containers, you need to understand the role of apps. If you haven’t already, [read more about apps in the Framework](index.html#framework). 

To get started working with or developing apps, browse to the [documentation for developing apps](app-development.html).

**Ready to start coding?** 

<p><a href="#developing-f2-containers" class="btn btn-primary">Developing F2 Containers</a> <a href="./sdk/" class="btn">F2.js SDK Reference</a></p>

* * * *

## Container Design

Design considerations are an important first step when creating a new container. Content can range from news to research to multimedia, and content should be presented using [Progressive Enhancement]((http://www.alistapart.com/articles/understandingprogressiveenhancement/), [Mobile First](http://www.lukew.com/presos/preso.asp?26) and [Responsive Design](http://www.abookapart.com/products/responsive-web-design) methodologies. That is to say multimedia content, for example, should be shown plugin-free (using HTML5 video or audio elements) for capable browsers and fallback to Flash-based players for browsers that do not yet support HTML5 related technologies. ([VideoJS](http://videojs.com/) is good example of open-source JavaScript and CSS "that makes it easier to work with and build on HTML5 video, today.")

If App Developers embed URLs back to their own websites or to third party sites, URLs must be opened in a new window as to not interrupt the experience of someone using the container. If authentication is required on an App Developer's site, this can be accomplished with pass-through authentication using encrypted URLs as discussed in [Single Sign On](#single-sign-on).

### Choices

In order to ensure that apps built using F2 are successful, they must be accessible. As such, F2 made choices for which open-source libraries and frameworks would be leveraged to reduce the level of effort across F2 adopters. 

[Read more about those choices in the Framework](index.html#choices).

Ultimately, the responsibility of app design falls on either the Container or App Developer. In many cases, Container Developers will provide App Developers will visual designs, style guides or other assets required to ensure apps have the form and function for a given container. Container Developers may also [provide CSS for App Developers](index.html#creating-a-common-look-and-feel) to adhere to&mdash;which should be easy since F2 enforces a [consistent HTML structure across all containers and apps](app-development.html#automatic-consistency).

* * * *

## Developing F2 Containers

A container is a browser-based desktop-like application which brings F2 apps together onto a seamless user interface. It also can provide horsepower to its apps in the form of request-response web services or streaming data feeds.

### Including the F2 SDK

For a webpage to be considered an F2 container, it must first include the [F2.js JavaScript SDK](f2js-sdk.html). This is as simple as [downloading the F2 project from GitHub](f2js-sdk.html#download) and adding a `script` tag to the page. 

```javascript
<script src="/path/to/your/container/f2.js"></script>
```

You will find a basic container in the [project repo on GitHub](https://github.com/OpenF2/F2/tree/master/examples/container/) along with a number of sample apps.

Once the script tag has been added, it is up to the Container Developer to configure and customize the container. The first step is getting a ContainerID.

### F2 ContainerID

To develop a production F2 container, you need a unique identifier called a ContainerID. This ContainerID will be unique to _your container_ across the entire open financial framework ecosystem. The format of the ContainerID looks like this: `com_container_companyName_containerName`, where the `companyName` "namespace" is your company name and `containerName` is the name of your container.

As an example, your ContainerID could look like this:

`com_container_acmecorp_watchlist`

If you built more than one container while working at Acme Corporation, you could create more ContainerIDs. All of these are valid:

* `com_container_acmecorp_activetrader`
* `com_container_acmecorp_retail`
* `com_container_acmecorp_mobilestreamer`

To guarantee uniqueness, we will provide a ContainerID generation service that allows customization of your ContainerID in the [Developer Center](index.html#developer-center).

### Setting Up Your Project

Once you have your ContainerID, start by setting up your container project. You will need at least one configuration in addition to an HTML page: the app configs. (In the GitHub repository, [an example](https://github.com/OpenF2/F2/blob/master/examples/container/js/sampleApps.js) is found in `/examples/container/js/sampleApps.js`.) This doesn't need to be a static javascript file like `sampleApps.js` but the structure and format of the app configs is important.

### App Configs

An F2 Container Provider must deliver the app configs to its container before calling `F2.init()`. The app configurations are represented quite simply as a list of [AppConfig objects](../docs/sdk/classes/F2.AppConfig.html). These could be stored in a JavaScript array or in an enterprise-class database. AppConfig objects contain app meta data provided by the App Developer when he creates his app in the [Developer Center](index.html#developer-center). 

Example `AppConfig` object from an _individual_ app:

```javascript
{
	appId: "com_companyName_appName",
	description: "App description",
	height: 500,
	manifestUrl: "http://www.domain.com/manifest.js",
	name: "App name"
}
```

Example array of `AppConfig` objects for a collection of apps:

```javascript
var _appConfigs = [
	{
		appId: "com_companyName_appName",
		description: "App description",
		height:500,
		manifestUrl: "http://www.domain.com/manifest.js",
		name: "App name"
	},
	{
		appId: "com_companyName_appName2",
		description: "App2 description",
		height:100,
		manifestUrl: "http://www.domain2.com/manifest.js",
		name: "App2 name"
	},
	{
		appId: "com_companyName_appName3",
		description: "App3 description",
		height:200,
		manifestUrl: "http://www.domain3.com/manifest.js",
		name: "App3 name"
	}
];
```

### Container Config

The [F2.js JavaScript SDK](f2js-sdk.html) provides an API for providers to configure their containers. Every container must be setup using `ContainerConfig` and the [methods available](./sdk/classes/F2.ContainerConfig.html).

In the container's `$(document).ready()`, add the `F2.init()`:

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

To see an more detailed example of `F2.init()`, [look at the sample container javascript file](https://github.com/OpenF2/F2/blob/master/examples/container/js/container.js) in the F2 repo on GitHub.

#### AppRender

The `appRender()` method allows the container to wrap an app in extra HTML. The function should accept an `F2.AppConfig` object and also a string of `HTML`. The extra HTML can provide links to edit app settings and remove an app from the container. See `F2.Constants.Css` for CSS classes that should be applied to elements.

#### BeforeAppRender

The `beforeAppRender()` method allows the container to render HTML for an app before the `AppManifest` for an app has loaded. This can be useful if the design calls for loading spinners to appear for each app before each app is loaded and rendered to the page.

#### AfterAppRender

The `afterAppRender()` method allows the container to override how an app's HTML is inserted into the page. The function should accept an `F2.AppConfig` object and also a string of `HTML`.

For more information on `F2.ContainerConfig`, [browse to the F2.js SDK docs](./sdk/classes/F2.ContainerConfig.html).

#### F2 UI Mask

Container Developers have the opportunity to customize some user interface (UI) elements which propagate to the App Developers' toolkit in F2.js. One of those is `F2.UI.Mask`. The `Mask` object contains configuration defaults for the `F2.UI.showMask()` and `F2.UI.hideMask()` methods.

An example of setting the mask in `F2.init()`:

```javascript
$(document).ready(function(){
    F2.init({
        //define ContainerConfig properties
		appRender: function(appConfig, html){ ... },
		beforeAppRender: function(appConfig, html){ ... },
		afterAppRender: function(appConfig){ ... },

        //setup UI
        UI:{
			Mask:{
				loadingIcon:'./img/spinner.gif',
				backgroundColor: '#fff',
				opacity: 0.5
			}
		}
    });
});
```

Included in the `F2.UI.Mask` configuration object are the following properties: `backgroundColor`, `loadingIcon`, `opacity`, `useClasses`, and `zIndex`. Each of these `F2.UI.Mask` properties is detailed in [the F2.js SDK docs](./sdk/classes/F2.ContainerConfig.UI.Mask.html).

For more information on `F2.UI`, [browse to the F2.js SDK docs](./sdk/classes/F2.UI.html).

#### Container Templates

If you're looking for sample container HTML template code, jump to the [Get Started section](#get-started). There is also a basic F2 container/app template [available for download on GitHub](https://github.com/downloads/OpenF2/F2/Basic-F2-App-Template-1.0.4.zip).

* * * *

## Namespacing

F2 is a _web_ integration framework which means apps are inherently insecure&mdash;at least those _non-secure_ apps. Following this spec, App Developers must avoid CSS collisions and JavaScript namespace issues to provide users with the best possible experience.

<span class="label">Note</span> Continue reading for [more specifics about secure apps](#secure-apps).

### Namespacing CSS

As discussed in [Developing F2 Containers: F2 ContainerID](#f2-containerid), to develop an F2 container, you need a unique identifier called an ContainerID. This ContainerID will be unique to your container across the entire open financial framework ecosystem. The format of the ContainerID looks like this: `com_container_companyName_appName`, where the `companyName` "namespace" is your company name and `appName` is the name of your app.

To avoid styling conflicts or other display issues related to app-provided style sheets, App Developers [must namespace their CSS selectors](app-development.html#namespacing-css). While there are strict rules for App Developers, the same rules apply to Container Developers. This is especially true when implementing _mutliple containers_.

In the event there are multiple containers, every CSS selector in container-provided style sheets must look like this:

```css
.com_container_companyName_appName p {
	padding:5px;
}

.com_container_companyName_appName .alert {
	color:red;
}
```

Note `.com_container_companyName_appName` is prefixed on both `p` and `.alert` selectors.

While the [CSS cascade](http://www.webdesignfromscratch.com/html-css/css-inheritance-cascade/) will assign more points to IDs and prefixing F2 ContainerIDs on CSS selectors isn't required, it is recommended.

```css
.com_container_companyName_appName #notice {
	background-color:yellow;
}
```

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

[Read more in the Framework](index.html#framework).

### How to use Context

Each container will be responsible for hosting the [F2.js JavaScript SDK](f2js-sdk.html). The F2 SDK not only provides the consistent mechanism app developers have come to expect for loading their apps on the container, but also contains an [event API](./sdk/classes/F2.Events.html) for handling context.

<span class="label label-important">Important</span> It is important to note that while apps can have context themselves, the responsibility for managing context switching or context passing falls on the container. The container assumes the role of a traffic cop&mdash;managing which data goes where. By using JavaScript events, the container can listen for events sent by apps and likewise apps can listen for events sent by the container. This means **apps cannot communicate directly with other apps on their own**; apps communicate via the container to other apps since the container controls the `F2.Events` API.

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

<span class="label">Note</span> For a full list of support event types, browse to the SDK for [F2.Constants.Events](./sdk/classes/F2.Constants.Events.html).

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

The container would need to listen to your apps' broadcasted `F2.Constants.Events.APP_SYMBOL_CHANGE` event using code like this:

```javascript
F2.Events.on(
	F2.Constants.Events.APP_SYMBOL_CHANGE, 
	function(data){
		F2.log("The symbol was changed to " + data.symbol);
	}
);
```

<span class="label">Note</span> For a full list of support event types, browse to the SDK for [F2.Constants.Events](./sdk/classes/F2.Constants.Events.html).

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

## App Integration

The process of loading apps on a container happens through a method called `F2.registerApps()`. The Container Developer must call [this method](./sdk/classes/F2.html)&mdash;which accepts two arguments, one required, one optional&mdash; after `F2.init()` is called. If this method isn't called, no apps can be loaded on the container.

The two arguments provided to `registerApps()` are an array of `AppConfig` objects and, optionally, an array of `AppManifest` objects. As F2.js parses each `AppConfig`, the apps are validated, hydrated with some additional properties, and saved in F2 memory on the container.

Regardless of where the container's [AppConfig](#app-configs) comes from, integrating apps is a simple process. For the purposes of this example, we will use an Acme Corp news app. 

Let's look at some container code.

### Static App Configuration

First, we define the `AppConfigs` in a _hard-coded_ `_appConfigs` array. Secondly, when the document is ready, we call `F2.init()` and subsequently `F2.registerApps()` with the single argument.

```javascript
//define app config
var _appConfigs = [
	{
		appId: "com_acmecorp_news",
		description: "Acme Corp News",
		manifestUrl: "http://www.acme.com/apps/news-manifest.js",
		name: "Acme News App"
	}
];

$(document).ready(function(){

	//init F2 container
    F2.init({
        //define ContainerConfig properties
		appRender: function(appConfig, html){ ... },
		beforeAppRender: function(appConfig, html){ ... },
		afterAppRender: function(appConfig){ ... },

        //setup UI
        UI:{
			Mask:{
				loadingIcon:'./img/spinner.gif',
				backgroundColor: '#fff',
				opacity: 0.5
			}
		}
    });

    //load apps
    F2.registerApps(_appConfigs);

});
```

This javascript code will insert the Acme Corp news app into the container's DOM, provided the `appRender` method is [configured correctly](#container-config).

### Dynamic App Configuration

Alternatively, `AppConfigs` could live in a database&mdash;eventually the [F2 Store](index.html#the-store)&mdash;at which time container developers could provide their containers with `AppManifests` instead of relying on each `AppConfig.manifestUrl` property to be retrieved and parsed at run time.

Such an implementation would require the container developer to make a HTTP call to a Store web service to retrieve `AppConfigs` and `AppManifests`. You are already familiar with [what the `AppConfig` looks like](#app-configs), but if you aren't sure what an `AppManifest` looks like, take note of this empty manifest. 

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

<span class="label">Note</span> [Read more about the AppManifest](app-development.html#app-manifest).

An example of a container making a request to the F2 Store for `AppConfigs` and `AppManifests`:

```javascript
(function(){
	
	var _appConfigs = [], _appManifests = [];

	//make request to Store web service
	var $req = $.ajax({
		url: 'https://store.openf2.org/getApps',
		dataType: 'jsonp'
	});

	//parse successful response
	$req.done(function(jqxhr,txtStatus){
		jqxhr = jqxhr || {};
		if (jqxhr.status == "good"){
			_appConfigs = jqxhr.appConfigs || [];
			_appManifests = jqxhr.appManifests || [];
			//load
			loadContainer();
		} else {
			F2.log("Store web service did not do something 'good'.", jqxhr, txtStatus);
		}
	});

	//handle errors
	$req.fail(function(jqxhr,txtStatus){
		F2.log("Store web service failed.", jqxhr, txtStatus);
	});

	//wrap this up so we can call it in $req.done()
	var loadContainer = function(){
		$(document).ready(function(){
			//init F2 container
		    F2.init({
		        //define ContainerConfig properties
				appRender: function(appConfig, html){ ... },
				beforeAppRender: function(appConfig, html){ ... },
				afterAppRender: function(appConfig){ ... },

		        //setup UI
		        UI:{
					Mask:{
						loadingIcon:'./img/spinner.gif',
						backgroundColor: '#fff',
						opacity: 0.5
					}
				}
		    });

		    //load apps
		    F2.registerApps(_appConfigs, _appManifests);

		});
	}//loadContainer
	
})();
```

<span class="label label-important">Important</span> The `_appConfigs` and `_appManifests` arrays must be of equal length, and the object at each index must be a parallel reference. This means the `AppConfig` and `AppManifest` for Acme Corp's news app must be in `_appConfigs[0]` and `_appManifests[0]`.

There are numerous benefits to dynamic app configuration, most notably performance and security. In the dynamic model, `AppManifests` have already been requested and loaded before a user opens the container reducing the overall number of outbound HTTP requests. Security is improved because Container Developers have the opportunity to parse and scrub `AppManifest` contents before F2.js injects markup in the `AppManifest.html` property into the container DOM.

* * * *

## Secure Apps

Security is a fundamental requirement of any F2 container and many F2 apps. With that in mind, the integration of secure apps on a container requires more attention and effort. The process of [app integration](#app-integration) remains largely the same for integrating _secure_ apps with one significant addition: a _second_ container.

To support a secured container environment, one of the [choices](index.html#choices) made when writing this specification was the inclusion of an open-source cross-domain in-browser secure messaging library. For this, F2 relies on [easyXDM](https://github.com/oyvindkinsey/easyXDM). EasyXDM helps front-end developers safely work around the [Same Origin Policy](https://developer.mozilla.org/en-US/docs/Same_origin_policy_for_JavaScript) using browser-supported techniques without compromising the user experience. For all browsers, the easyXDM transport stack offers bi-directionality, reliability, queueing and sender-verification.

### Container Config

The process of [configuring an F2 container](#container-config) to be secure is identical to that of an unsecure container. As such, every container must be setup using `ContainerConfig` and the [methods available](../docs/sdk/classes/F2.ContainerConfig.html).

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

<span class="label label-important">Important</span> Therefore Container Developers need two containers: one non-secure (parent), one secure (child). The parent container can follow the [basic template](#basic-container-template) style and must call `F2.init()` and `F2.registerApps()` appropriately. Per the above, it must also define the `secureAppPagePath` property in its `ContainerConfig`. To see a working container, [browse to the examples in the project repo on GitHub](https://github.com/OpenF2/F2).

Since it will be loaded in an iframe and like its parent, the secure child container must also include a [copy of the F2.js SDK](f2js-sdk.html). Additionally, it must also call `F2.init()` with a unique `ContainerConfig`. 

```javascript
F2.init({
	appRender:function(appConfig, html) {
		return [
			'<div class="span4">',
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

<span class="label">Note</span> The Container Developer is free to utilize any app authentication method they deem fit. Container Developers and App Developers will need to work together to finalize the authentication details.

### Using Encrypted URLs

Implementing SSO using encrypted URLs is a simple and straight-forward authentication mechanism for securing cross-domain multi-provider apps. To guarantee security between the Container and App Developers, secure API contracts must be negotiated. This includes, but is not limited to, the choice of cryptographic algorithm (such as `AES`) and the exchange of public keys.

When the Container Developer calls `F2.registerApps()`, custom logic should be added to append encrypted user credentials&mdash;on a need-to-know basis&mdash;to _each app_ requiring authentication.

### Considerations

Authentication is a critical part of any container-app relationship. There are a plethora of SSO implementations and there are many considerations for both Container and App Developers alike.

_Further details around container and app single sign-on will be forthcoming as the F2 specification evolves._

* * * *
