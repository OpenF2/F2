% Developing F2 Containers

<p class="lead">To understand how F2 containers work or to get started building a container, you've come to the right place. If you have not yet cloned the F2 repo on GitHub or downloaded the latest build, you should do that now by reading the [quick start guide](https://github.com/OpenF2/F2#quick-start).</p>

## The Container

To understand F2 and the role of apps, you need to understand the role of the **container**.

![](./img/wwp_devices.png "Containers and Apps on desktop and mobile")

The F2 container is most simply described as the user interface and the location where all apps reside. More specifically, the container is a web page which is "aware" of its contents (the apps) and plays the role of a traffic cop managing [context](developing-f2-apps.html#context) passing between F2 apps (if there are more than one). Further, the container can have any variation of intelligence on a wide spectrum which means it can provide data via web services to apps or simply host the F2.js JavaScript SDK.

Each container provider, or individual person or company hosting a container, shall be responsible for including the [F2.js JavaScript SDK](https://github.com/OpenF2/F2/blob/master/sdk/f2.min.js). Through the SDK, F2.js provides a consistent means for all F2 apps to get loaded on any container regardless of where it is hosted, who developed it, or what back-end stack it uses.

### Get Started

To help you get started, you will find a basic container in the [project repo on GitHub](https://github.com/OpenF2/F2/tree/master/sdk/examples/container/) along with a number of sample apps. Once you download or clone it, open the project repository and point your browser at:

`http://localhost/F2/sdk/examples/container/`

<div class="well well-small">
<h4>Configuration</h4>
<p>It is assumed you will be developing a F2 container locally and have a localhost setup. The URLs mentioned in this specification assume you have configured your F2 container and apps to run at `http://localhost/F2/`. The examples provided as part of the project repository demonstrate apps written in different languages (PHP, JavaScript, C#). While it is not a requirement you have a web server configured on your computer, it will certainly allow you to more deeply explore the sample apps.</p>
</div>

* * * *

## Context

### What is Context? 

Regardless of type of app, a display or data app has "context"&mdash;that is to say an app "knows" about where it is, what is happening around it, and possibly who is viewing it. At the discretion of the app itself, an app can be aware of a specific user's data entitlements as well as information about the user (name, email, company, etc). Additionally, an app is capable of sharing context with the container and nearby apps. This means if Susan wants to create a ticker-focused workspace so she can watch her shares of Apple stock increase in value, the container can send "symbol context" to any listening apps which can be smart enough to refresh themselves focusing on [AAPL](http://www.google.com/finance?q=NASDAQ%3AAAPL).

### How to use Context

Each Container will be responsible for hosting the F2 JavaScript SDK. The F2 SDK not only provides the consistent mechanism app developers have come to expect for loading their apps on the container, but also contains an [event API](../sdk/docs/classes/F2.Events.html) for handling context.

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

The `F2.Events.on()` method accepts the event name and listener function as arguments. [Read the SDK](../sdk/docs/classes/F2.Events.html) for more information.

<span class="label">Note</span> For a full list of support event types, browse to the SDK for [F2.Constants.Events](../sdk/docs/classes/F2.Constants.Events.html).

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

<span class="label">Note</span> For a full list of support event types, browse to the SDK for [F2.Constants.Events](../sdk/docs/classes/F2.Constants.Events.html).

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

### Using AppIDs to Secure Context Passing

What if you want your app to only receive context emitted from apps you trust? 

Every F2 app has a [unique AppID](#developing-a-f2-app) and&mdash;using the AppID&mdash;apps can listen for events emitted from trusted sources.

<span class="label label-warning">EDITOR'S NOTE</span> Needs attn.

### Types of Context

Context is a term used to describe the state of a F2 container and its apps. At the same time, Context is also the information passed from [Container-to-App](#container-to-app-context) or from [App-to-App](#app-to-app-context) or from [App-to-Container](#app-to-container-context). In the examples shown above, two types of context were shown: symbol and trade ticket context. It is important realize F2.js allows client-side messaging between third parties using a collection of arbitrary name-value pairs. This provides the utmost flexibility and affords Container providers the option to define context within their container.

Said another way, while `{ symbol:"AAPL", name: "Apple, Inc" }` can be used to communicate symbol context, developers could also use `{ symbol: "123456789" }` to identify Apple, Inc. The latter is more likely given not all apps would programmatically understand `AAPL` but&mdash;given symbol lookup services&mdash;would understand `123456789` as the universal _F2_ identifier for Apple, Inc. It is clear Container and App developers alike would prefer to communicate with a guaranteed-to-never-change universal ID for all instrument types across all asset classes.

* * * *

## Developing a F2 Container

A Container is a browser-based desktop-like application which brings F2 apps together onto a seamless user interface. It also can provide horsepower to its apps in the form of request-response web services or streaming data feeds.

### F2 ContainerID

To develop a F2 container, you need a unique identifier called an **ContainerID**. This ContainerID will be unique to _your container_ in the entire open financial framework ecosystem. While you don't need a unique ContainerID during the container development process, it is recommended you get one. The format of the ContainerID looks like this: `f2c_companyName_containerName`, where the `companyName` "namespace" is your company name and `containerName` is the name of your container.

As an example, your ContainerID could look like this:

`f2c_acmecorp_watchlist`

If you built more than one container while working at Acme Corporation, you could create more ContainerIDs. All of these are valid:

* `f2c_acmecorp_activetrader`
* `f2c_acmecorp_retail`
* `f2c_acmecorp_interactive_charts`

To guarantee uniqueness, we have provided a ContainerID generation service that allows you to customize your ContainerID. _This will be available in fall 2012._

### Setting Up Your Project

Once you have your ContainerID, start by setting up your container project. You will need at least one configuration in addition to a HTML page: the app configs. (In the GitHub repository, an example is found in `/F2/sdk/examples/container/js/sampleApps.js`.) This doesn't need to be a static javascript file like `sampleApps.js` but the structure and format of the app configs is important.

### Apps Config

A F2 Container provider must deliver the app configs to itself before calling `F2.init()`. The app configs is quite simply a javascript array of [AppConfig objects](../sdk/docs/classes/F2.AppConfig.html)&mdash;which is app meta data provided by the apps' developer. 

Example `AppConfig` object from an _individual_ app:

```javascript
{
	appId: "com_companyName_appName",
	description: "App description",
	height:500,
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

For the purposes of the examples shown here, the `_appConfigs` array is a static collection of F2 App `AppConfig` objects. In an actual container implementation, each `AppConfig` object would be stored in the [App Catalog](#) database.

### Basic Container Template

The simplest template for a Container looks like this:

```html
<!DOCTYPE html>
<html>
	<head>
		<title>F2 Container</title>
		<meta name="X-UA-Compatible" content="IE=edge,chrome=1" />
		<meta name="viewport" content="device-width" />
		<script src="http://dev.domain.com/ResourceManager/modernizr.js"></script>
	</head>
	<body>
		
		<h1>Hello F2</h1>

		<!--include F2.js-->
		<script src="http://dev.domain.com/js/F2.min.js?1.0"></script>
		<!--init & register-->
		<script>
			(function(){
				var _appConfigs = [...]; //define app configs
				F2.init();
				F2.registerApps(_appConfigs); //pass _appConfigs array to registerApps()
			})();
		</script>
	</body>
</html>
```

In developing a more advanced Container, the HTML document's `body` element would contain additional markup and allow for specific positioning or placement of Apps. Such an example might look like this:

```html
<!DOCTYPE html>
<html>
	<head>
		<title>F2 Container</title>
		<meta name="X-UA-Compatible" content="IE=edge,chrome=1" />
		<meta name="viewport" content="device-width" />
		<script src="http://dev.domain.com/js/modernizr.js"></script>
	</head>
	<body>
		<header>
			<nav>
				<a href="/home">Home</a>
			</nav>
		</header>
		<section>
			<h1>Hello F2</h1>
			<p>Hi.</p>
		</section>
		<footer>
			&copy; 2012 F2 Container.
		</footer>

		<!--include F2.js-->
		<script src="http://dev.domain.com/js/F2.min.js?1.0"></script>
		<!--init & register-->
		<script>
			(function(){
				var _appConfigs = [...]; //define app configs
				F2.init();
				F2.registerApps(_appConfigs); //pass _appConfigs array to registerApps()
			})();
		</script>
	</body>
</html>
```

Additionally, more advanced containers could introduce features and functionality to their apps in the form of authentication APIs, streaming data feeds, federated search, common UI components, etc.

### Container Configuration 

`ContainerConfig`

<span class="label label-warning">EDITOR'S NOTE</span> This section needs some TLC.

`F2.ContainerConfiguration.beforeAppRender` has been added
`F2.ContainerConfiguration.appWrapper` has been renamed to `F2.ContainerConfig.appRender`
`F2.ContainerConfiguration.appWriter` has been renamed to `F2.ContainerConfig.afterAppRender`

## F2.UI

<span class="label label-warning">EDITOR'S NOTE</span> This section needs some TLC.

F2.UI.setMaskConfiguration()

## How to Consume an App

A Container developer only needs to be concerned with developing and hosting a Container. Through the Container and App APIs, Containers will consume Apps automatically. The consumption of an App onto the Container is managed either by individual users (in the configurable Container) or by a Container administrator (in the non-configurable Container). 

Depending on the Container design, users are typically shown a menu of Apps from which to choose as they are customizing their workspace(s). When a user chooses to add an App, the App will “load” itself (per the section titled “Loading an App on the Container”) on the Container. 

## Other Possible Container Features

### Search

Each Container Provider shall be responsible for implementing search functionality. Users should be able to search content specific to either a Content provider itself or the Apps as part of the Container. Taking the example of Context, Containers need to be able to allow users to search for financial content – usually starting with the symbol of an instrument.

Financial users will usually be dealing with lists of issues or individual entities. In order to share Context between apps, there will need to be a protocol for specifying the individual entities, issues, or products, as an individual item, or as a list of similar items. In order to do this, both data providers and app providers will need to use a standard and shared identification system. 

Markit’s reference data technology, or “XRef" (for symbol cross-reference), can be leveraged for this use. Web services can be made available to both App and Container developers to ensure all parties can (technically) converse about the same entities.

### Directory

A directory of financial users would be necessary in order to organize and share app store entitlements. Access to this directory could also be an App. 

Markit Directory is a centralized, cloud-based service that creates and manages a “golden record” unique ID for an individual’s profile details. The processing of profiles, administration interfaces to managing exceptions, reference data, auditing, security, privacy and extensible APIs are all components of the Directory. The Directory enables portability of identity information across security domains and will be the single source for all industry participants for profile information.

Both App and Container developers could leverage Markit Directory to share user information (as part of Context) between Apps and Containers.

### Messaging

Federated Messaging is an app that only Markit can provide by virtue of its exclusive license with NextPlane. Markit’s federated messaging App will enable any user, regardless of their firm’s instant messaging system, to monitor presence and send message to anyone else, regardless of messaging system.

