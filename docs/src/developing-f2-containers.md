% Container Development

<p class="lead">You've come to the right place if you want to begin building F2 containers. Before continuing, make sure you've cloned the F2 repo on GitHub or downloaded the latest build. Browse to the [quick start guide](https://github.com/OpenF2/F2#quick-start) to find out how. Secondly, [read about the F2 Framework](index.html#framework). There are a few important concepts to help you better understand apps, containers and context.</p>

## Get Started

To help you get started, you will find a basic container in the [project repo on GitHub](https://github.com/OpenF2/F2/tree/master/examples/container/) along with a number of sample apps. Once you open the project repository, point your browser at:

`http://localhost/F2/examples/container/`

### Configuration

It is assumed you will be developing a F2 Container locally and have a `localhost` setup. The URLs mentioned in this specification assume you have configured your F2 Container and Apps to run at `http://localhost/F2/`. The examples provided as part of the project repository demonstrate apps written in different languages (PHP, JavaScript, C#). While it is not a requirement you have a web server configured on your computer, it will certainly allow you to more deeply explore the sample apps.

**Ready to start coding?** [Jump to Developing a F2 Container](#developing-a-f2-container).

* * * *

## Container Design

* * * *

## Developing F2 Containers

A Container is a browser-based desktop-like application which brings F2 apps together onto a seamless user interface. It also can provide horsepower to its apps in the form of request-response web services or streaming data feeds.

### Including the SDK...>?!?!?!?!?

For a webpage to be considered an F2 container, it must first include the [F2.js JavaScript SDK](../sdk/classes/F2.html). This is as simple as [downloading the F2 project from GitHub](https://github.com/OpenF2/F2/zipball/master) and adding a `script` tag to the page. 

```javascript
<script src="/path/to/your/container/f2.min.js"></script>
```

You will find a basic container in the [project repo on GitHub](https://github.com/OpenF2/F2/tree/master/examples/container/) along with a number of sample apps.

Once the script tag has been added it is up to the Container Provider to configure and customize the container. Continue reading Developing Containers](#developing-containers) below.

### F2 ContainerID

To develop a F2 container, you need a unique identifier called an **ContainerID**. This ContainerID will be unique to _your container_ in the entire open financial framework ecosystem. While you don't need a unique ContainerID during the container development process, it is recommended you get one. The format of the ContainerID looks like this: `f2c_companyName_containerName`, where the `companyName` "namespace" is your company name and `containerName` is the name of your container.

As an example, your ContainerID could look like this:

`f2c_acmecorp_watchlist`

If you built more than one container while working at Acme Corporation, you could create more ContainerIDs. All of these are valid:

* `f2c_acmecorp_activetrader`
* `f2c_acmecorp_retail`
* `f2c_acmecorp_interactive_charts`

To guarantee uniqueness, we have provided a ContainerID generation service that allows you to customize your ContainerID in the [Developer Center](index.html#developer-center).

### Setting Up Your Project

Once you have your ContainerID, start by setting up your container project. You will need at least one configuration in addition to an HTML page: the app configs. (In the GitHub repository, [an example](https://github.com/OpenF2/F2/blob/master/examples/container/js/sampleApps.js) is found in `/examples/container/js/sampleApps.js`.) This doesn't need to be a static javascript file like `sampleApps.js` but the structure and format of the app configs is important.

### App Configs

A F2 Container Provider must deliver the app configs to its container before calling `F2.init()`. The app configurations are represented quite simply as a list of [AppConfig objects](../docs/sdk/classes/F2.AppConfig.html). These could be stored in a JavaScript array or an enterprise-class database. AppConfig objects contain app meta data provided by the App Developer when he creates his app in the [Developer Center](index.html#l#developer-center). 

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

The F2.js JavaScript SDK provides an API for providers to configure their containers. Every container must be setup using `ContainerConfig` and the [methods available](../docs/sdk/classes/F2.ContainerConfig.html).

In the container's `$(document).ready()`, add the `F2.init()`:

```javascript
$(document).ready(function(){
	F2.init({
		//define ContainerConfig properties
		appRender: function(){},
		beforeAppRender: function(){},
		afterAppRender: function(){}
	});
});
```

To see an more detailed example of `F2.init()`, [look at the sample container javascript file](https://github.com/OpenF2/F2/blob/master/examples/container/js/container.js) in the F2 repo on GitHub.

#### AppRender

The `appRender()` method allows the container to wrap an app in extra HTML. The function should accept an `F2.AppConfig` object and also a string of HTML. The extra HTML can provide links to edit app settings and remove an app from the Container. See `F2.Constants.Css` for CSS classes that should be applied to elements.

#### BeforeAppRender

The `beforeAppRender()` method allows the container to render HTML for an app before the `AppManifest` for an app has loaded. This can be useful if the design calls for loading spinners to appear for each app before each app is loaded and rendered to the page.

#### AfterAppRender

The `afterAppRender()` method allows the container to override how an app's HTML is inserted into the page. The function should accept an `F2.AppConfig` object and also a string of HTML.

For more information on `F2.ContainerConfig`, [browse to the F2.js SDK docs](../docs/sdk/classes/F2.ContainerConfig.html).

#### F2 UI Mask

In version 1.0, Container Providers have the opportunity to customize some user interface (UI) elements which propagate to the App Developers' toolkit in F2.js. One of those is `F2.UI.Mask`. The `Mask` object contains configuration defaults for the `F2.UI.showMask()` and `F2.UI.hideMask()` methods.

An example of setting the mask in `F2.init()`:

```javascript
$(document).ready(function(){
    F2.init({
        //define ContainerConfig properties
        appRender: function(){},
        beforeAppRender: function(){},
        afterAppRender: function(){},

        //setup UI
        UI:{
			Mask:{
				loadingIcon:'./img/spinner.gif'
			}
		}
    });
});
```

Included in the `F2.UI.Mask` configuration object are the following properties: `backgroundColor`, `loadingIcon`, `opacity`, `useClasses`, and `zIndex`. Each of these `F2.UI.Mask` properties is detailed in [the F2.js SDK docs](../docs/sdk/classes/F2.ContainerConfig.UI.Mask.html).

For more information on `F2.UI`, [browse to the F2.js SDK docs](../docs/sdk/classes/F2.UI.html).

* * * *

## Namespacing

### CSS

### JavaScript

* * * *

## App Integration

The process of loading apps on a container happens through a method called `F2.registerApps()`. The Container Provider must call [this method](../docs/sdk/classes/F2.html#methods-registerApps)&mdash;which accepts two arguments, one required, one optional&mdash; after `F2.init()` is called. If this method isn't called, no apps can be loaded on the container.

The two arguments provided to `registerApps()` are an array of `AppConfig` objects and an array of `AppManifest` objects. As F2.js parses each `AppConfig`, the apps are validated, hydrated with some additional properties, and saved to the container.

Remember, the `AppConfig` [includes a `manifestUrl` property](#app-configs).



```
//F2.registerApps(apps);
```

* * * *

## Secure Apps

* * * *

## Context

Apps are capable of sharing "context" with the Container and other nearby Apps. All Apps have context which means the App "knows" who is using it and the content it contains. It is aware of an individual's data entitlements and user information that the Container is requested to share (name, email, company, etc).  

Apps are capable of sharing context with their Container and other nearby Apps. This means if a user wants to create a ticker-focused workspace so they can keep a close eye on shares of Proctor & Gamble, the Container can send "symbol context" to any listening Apps that are smart enough to refresh when ticker symbol PG is entered in the Container's search box.

While Apps can have context themselves, the responsibility for managing context switching or context passing falls on the Container. The Container assumes the role of a traffic cop—managing which data goes where. By using JavaScript events, the Container can listen for events sent by Apps and likewise Apps can listen for events sent by the Container. To provide a layer of security, this means Apps cannot communicate directly with other Apps on their own; Apps must communicate via an F2 Container to other Apps.

For more information about Context, [browse to the Framework](index.html#framework).

### How to use Context

Each Container will be responsible for hosting the [F2.js JavaScript SDK](f2js.html). The F2 SDK not only provides the consistent mechanism app developers have come to expect for loading their apps on the container, but also contains an [event API](../docs/sdk/classes/F2.Events.html) for handling context.

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

The `F2.Events.on()` method accepts the event name and listener function as arguments. [Read the SDK](../docs/sdk/classes/F2.Events.html) for more information.

<span class="label">Note</span> For a full list of support event types, browse to the SDK for [F2.Constants.Events](../docs/sdk/classes/F2.Constants.Events.html).

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

<span class="label">Note</span> For a full list of support event types, browse to the SDK for [F2.Constants.Events](../docs/sdk/classes/F2.Constants.Events.html).

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

<!--
### Using AppIDs to Secure Context Passing

What if you want your app to only receive context emitted from apps you trust? 

Every F2 app has a [unique AppID](#developing-a-f2-app) and&mdash;using the AppID&mdash;apps can listen for events emitted from trusted sources.

<span class="label label-warning">EDITOR'S NOTE</span> Needs attn.
-->

### Types of Context

Context is a term used to describe the state of an F2 container and its apps. At the same time, context is also the information passed from [Container-to-App](#container-to-app-context) or from [App-to-App](#app-to-app-context) or from [App-to-Container](#app-to-container-context). In the examples shown above, two types of context were shown: symbol and trade ticket context. It is important realize [F2.js](f2js.html) allows client-side messaging between third parties using a collection of arbitrary name-value pairs. This provides the utmost flexibility and affords Container providers the option to define context within their container.

#### Universal F2 Instrument ID

Said another way, while `{ symbol:"AAPL", name: "Apple, Inc" }` can be used to communicate symbol context, developers could also use `{ symbol: "123456789" }` to identify Apple, Inc. The latter is more likely given not all apps would programmatically understand `AAPL` but&mdash;given symbol lookup services&mdash;would understand `123456789` as the universal _F2_ identifier for Apple, Inc. It is clear Container and App Developers alike would prefer to communicate with a guaranteed-to-never-change universal ID for all instrument types across all asset classes. _Further details will be forthcoming as the F2 specification evolves._

* * * *

## Utilities

The F2.js JavaScript SDK provides utility methods for Container Developers. These are available within the `F2` namespace and complete details are in the [Reference documentation](../docs/sdk/classes/F2.html).

* * * *

## F2 UI

There are some utility methods provided within F2.js in the `UI` namespace. These helpers are for controlling layout, showing (or hiding) loading spinners, modals, managing views withing apps, and more.  To see which `UI` helpers are available to App Developers, [read about F2.UI for apps](developing-f2-apps.html#f2-ui).

For Container Developers, the use of F2's `UI` is more than likely limited to customizing the design aesthetic (CSS) and [configuring the UI properties](../). 

For complete details on `F2.UI`, [browse to the SDK docs](../docs/sdk/classes/F2.UI.html).

* * * *

## Entitlements

User or content entitlements are the responsibility of the App developer. Many apps will need to be decoupled from the content that they need. This could include apps like research aggregation, news filtering, streaming market data, etc. Similarly to how companies build their own websites today with their own authentication and access (or content) entitlements, F2 apps are no different.

_Further details around app entitlements will be forthcoming as the F2 specification evolves._

* * * *

## Single Sign-On

Single sign-on (SSO) will be a shared responsibility between the Container and App developer. In some cases, Containers will want all its apps to be authenticated seamlessly for users, and that will have to be negotiated between Container and App developers. For the purposes of this documentation, it is assumed Container providers will build and host authentication for access to their Container(s). 

Once a user is authenticated on the Container, how is the user then authenticated with all of the apps? [Encrypted URLs](#using-encrypted-urls).*

<span class="label">Note</span> The Container Provider is free to utilize any app authentication method they deem fit. Container providers and app developers will need to work together to finalize the authentication details.

### Using Encrypted URLs

Implementing SSO using encrypted URLs is a simple and straight-forward authentication mechanism for securing cross-domain multi-provider apps. To guarantee security between the Container provider and App provider, secure API contracts must be negotiated. This includes, but is not limited to, the choice of cryptographic algorithm (such as `AES`) and the exchange of public keys.

When the Container provider calls `F2.registerApps()`, custom logic should be added to append encrypted user credentials&mdash;on a need-to-know basis&mdash;to _each app_ requiring authentication.

### Considerations

Authentication is a critical part of any Container-App relationship. There are a plethora of SSO implementations and there are many considerations for both Container and App developers alike.

_Further details around container and app single sign-on will be forthcoming as the F2 specification evolves._

* * * *
