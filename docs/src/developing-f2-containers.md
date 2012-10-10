% Developing F2 Containers

<p class="lead">You've come to the right place if you want to begin building F2 containers. Before continuing, make sure you've cloned the F2 repo on GitHub or downloaded the latest build. Browse to the [quick start guide](https://github.com/OpenF2/F2#quick-start) to find out how. Secondly, [read about the F2 Framework](index.html#framework). There are a few important concepts to help you better understand apps, containers and context.</p>

## Get Started

To help you get started, you will find a basic container in the [project repo on GitHub](https://github.com/OpenF2/F2/tree/master/examples/container/) along with a number of sample apps. Once you open the project repository, point your browser at:

`http://localhost/F2/examples/container/`

### Configuration

It is assumed you will be developing a F2 Container locally and have a `localhost` setup. The URLs mentioned in this specification assume you have configured your F2 Container and Apps to run at `http://localhost/F2/`. The examples provided as part of the project repository demonstrate apps written in different languages (PHP, JavaScript, C#). While it is not a requirement you have a web server configured on your computer, it will certainly allow you to more deeply explore the sample apps.

**Ready to start coding?** [Jump to Developing a F2 Container](#developing-a-f2-container).

* * * *

## F2 Containers

For a webpage to be considered an F2 container, it must first include the [F2.js JavaScript SDK](../sdk/classes/F2.html). This is as simple as [downloading the F2 project from GitHub](https://github.com/OpenF2/F2/zipball/master) and adding a `script` tag to the page. 

```javascript
<script src="/path/to/your/container/f2.min.js"></script>
```

You will find a basic container in the [project repo on GitHub](https://github.com/OpenF2/F2/tree/master/examples/container/) along with a number of sample apps.

Once the script tag has been added it is up to the Container Provider to configure and customize the container. Continue reading Developing Containers](#developing-containers) below.

* * * *

## Developing Containers

A Container is a browser-based desktop-like application which brings F2 apps together onto a seamless user interface. It also can provide horsepower to its apps in the form of request-response web services or streaming data feeds.

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

* * * *

## Container Config

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

To see an more detailed example of `F2.init()`, [look at the sample container javascript](https://github.com/OpenF2/F2/blob/master/examples/container/js/container.js) in the F2 repo on GitHub.

### AppRender

The `appRender()` method allows the container to wrap an app in extra HTML. The function should accept an `F2.AppConfig` object and also a string of HTML. The extra HTML can provide links to edit app settings and remove an app from the Container. See `F2.Constants.Css` for CSS classes that should be applied to elements.

### BeforeAppRender

The `beforeAppRender()` method allows the container to render HTML for an app before the `AppManifest` for an app has loaded. This can be useful if the design calls for loading spinners to appear for each app before each app is loaded and rendered to the page.

### AfterAppRender

The `afterAppRender()` method allows the container to override how an app's HTML is inserted into the page. The function should accept an `F2.AppConfig` object and also a string of HTML.

For more information on `F2.ContainerConfig`, [browse over to the F2.js SDK docs](../docs/sdk/classes/F2.ContainerConfig.html).

### F2 UI Mask

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

For more information on `F2.UI`, [browse over to the F2.js SDK docs](../docs/sdk/classes/F2.UI.html).

* * * *

## Registering Apps

The process of loading apps on a container happens through a method called `F2.registerApps()`. The Container Provider must call [this method](../docs/sdk/classes/F2.html#methods-registerApps)&mdash;which accepts two arguments, one required, one optional&mdash; after `F2.init()` is called. If this method isn't called, no apps can be loaded on the container.

The two arguments provided to `registerApps()` are an array of `AppConfig` objects and an array of `AppManifest` objects. As F2.js parses each `AppConfig`, the apps are validated, hydrated with some additional properties, and saved to the container.


Remember, the `AppConfig` [includes a `manifestUrl` property](#app-configs).



```
//F2.registerApps(apps);
```

* * * *

## Secure Apps

* * * *

## Customizing

### CSS

#### Namespacing

### JavaScript

#### Namespacing

* * * *

## Context

### Events

* * * *

## Utils

### Get Container State

### IsInit

### RemoveAllApps

### RemoveApp

* * * *

## F2 UI

* * * *

## Extending F2

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
