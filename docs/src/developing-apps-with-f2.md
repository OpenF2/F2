## Overview

An App is a web page or microsite, written by an App developer that includes its own (entitled) data. Further, an App can be purchased (or entitled) from the App Store, and is displayed on the desktop or “Container”. The App developer is the person or company that designs, develops, and hosts the app.

Simplistically, an App is one of two things:

* Presentation App -- A presentation App is an HTML document and contains JavaScript, CSS, images and other objects. It displays data to users in a manner determined by the App designer and must adhere to this specification.
* Data App -- A data app is a content feed available in industry-standard formats including JSON, JSONP, RSS or App developer-designed XML.

## Relationship Between Container and App

Refer to [Together At Last: Containers and Apps](creating-F2.html).

## Development Requirements 

**Editor’s note:** Marry with jsdocs temporarily located at: 

<http://wksbbakerw7.wsod.local/internal/openfinancialframework/SDK/jsdoc/symbols/F2.Container.AppContext.html>

Each App must have a digital signature or unique identifier in the format of a GUID. This allows App Providers to register their App with the App Store and in turn the App Store can provide reporting metrics on App usage, purchases, etc. Additionally, having a unique ID allows the Container to interact with specific modules on the desktop using Context or in more simple cases using JavaScript’s document.getElementById() method.

Beyond a unique ID, Apps have other characteristics that define them within the Framework. The following are required attributes App developers must include in their Apps. The following data points should be represented within the presentation or data App:

```metafont
AppID – long (guid)
Name - string
Title - string
Context – object 
AcceptsContext – bool
DeveloperEmail - string
DeveloperURL – string
DeveloperCompanyName - string
```

Since Apps are comprised of mainly HTML, JavaScript and CSS, App development can be as complex as the App developer wishes with one significant limitation: an App cannot be allowed to negatively impact other Apps on the desktop. To prevent accidental impact, Apps are developed inside of JavaScript closure which means an App will not have any public methods and therefore is a closed cell. 

## Designing the App to Look Integrated with the Container

Design is an important first step in creating a new App. Using the Open Financial Framework’s upcoming design guidelines and App API, App Designers and Developers can take advantage of these available resources to develop Apps on their own schedules. The design guidelines will provide a common theme and offer a baseline for consistency between all Apps on the Container.

There is customization available and it will be imperative for App developers to follow Container-provided guidelines for consistency on a case-by-case basis. The ‘common theme’ provided by this Framework is not a template per se but rather a mechanism to facilitate faster development between numerous App developers.

## Loading an App on the Container 

Each App must “load” itself by calling a JavaScript method available in the SDK which will be hosted by the Container Provider. The arguments sent to “loadApp” are the App characteristics and any additional name/value data App Developers wish to include as part of their App’s Context.

```javascript
Container.loadApp({
	AppId: “1234-5678-9101-1121-3141-5161”,
	Name: “Acme Financials”,
	Title: “Acme Financials Module”,
	Context: {
		Symbol: “MSFT”,
		Name: “value”,
		List: [1,2,3,4]
	},
	AcceptsContext: true,
	DeveloperEmail: “dev@domain.com”,
	DeveloperURL: “http://domain.com”,
	DeveloperCompanyName: “Acme, Inc”
});
```

## Context

Each Container Provider shall be responsible for hosting the Container JavaScript API. This JavaScript framework provides a consistent means for all App Developers to load their Apps on any Container.

While Apps can have Context themselves, the responsibility for managing Context switching or Context passing falls on the Container. The Container assumes the role of a traffic cop – managing what data goes where. Using an Event Emitter, the Container can “listen” for events sent by Apps on configurable intervals and likewise Apps can listen for events sent by the Container. 

This is a sample of a Container sending Context to Apps. Firstly, the Container fires a “ContextUpdate” event.

```javascript
Container.on(“ContextUpdate”, { Symbol: “MSFT” }, function(ev,callback){
	console.log(“Context updated!”);
});
```

Apps are responsible for listening to the broadcasted “ContextUpdate” event. App developers can bind custom event handlers based on the emitted event. Using jQuery, a sample to refresh an app with a new symbol:

```javascript
$(“.myApp”).bind(“ContextUpdate”, function(ev,data){
	myApp.refresh(data.Symbol);
});
````

Likewise, Apps can send Context to the Container.

```javascript
App.on(“ContextUpdateToContainer”, { FullScreen: true }, function(ev, callback){
	console.log(“Context sent to Container!”);
});
```

The Container can then listen for App-emitted events.

```javascript
$(“#Container”).bind(“ContextUpdateToContainer”, function(ev,data){
	Container.showFullScreen();
});
```

Apps can also pass Context between Apps. If there are two or more Apps on a Container with similar Context and the ability to receive messages (yes, this is opt-out), Apps can communicate with each other.

For example, on your Container you have “App 1” which is a watch list app alongside “App 2” which is a snap quote app. Embedded within the Content in App 2 could be a button labeled “send to watch list”. Pressing that button would transmit the symbol of the stock currently being viewed in App 1 across to App 2 to be added to the watch list. Achieving that looks programmatically like this:

First, find the App you want to find the apps to which to send the Context to:

```javascript
var $apps = Container.getApps(bool canAcceptContext(true));
```

Secondly, emit an event from App 1:

```javascript
$apps.find(“App1”).on(
	“ContextToApp”, 
	{ Symbol”: “MSFT”, Action”: “ADD” }, 
	function(ev,data){
		myApp.refresh(data);
		}	
	);
```

And finally listen for that event within App 2:

```javascript
$apps.find(“App2”).bind(“ContextToApp”, function(ev,data){
	console.log(“Context received in App2!”);
});
```

## App Formats

Below is a sample request for an App named "Sample" in JSON format.

```metafont
http://www.domain.com/App/Factory/json?params=[{Id:"App1",Width:200,Name:"Value"}]
```

The "/json" format specifier in the above request could be safely omitted, as JSON is the default format. The widgets can be returned in a variety of formats as shown in the table below. Inclusion of a widget into an existing site varies based on the format requested.

The following output formats are required of any App:

-------------------------------------------------------------
Name 	Description
----	-----------
iframe  An inline JavaScript tag is inserted into the site. When the script is executed, an Iframe is written out to the page. The Iframe output format can be used for complex widgets or widgets that need to be self-contained.

json 	A JSON object containing the javascript, css, and widgets is inserted into the site via javascript already on the site.

jsonp 	Same as JSON but output is wrapped in a Callback function. Used for cross-domain communication and callbacks.

script 	An inline JavaScript tag tag is inserted into the site. Wen the script is executed, the javascript, css, and html for the widgets is written out to the page.
-------------------------------------------------------------

The JSON response format does not include type information. A description of the JSON format can be found at http://json.org. It will not be described in this Spec. A sample JSON response is shown below:

```javascript
{
	"InlineScripts" : [],	 
	"Scripts" : [],	 
	"Styles" : [],	 
	"Apps" : [
		{
			"Html" : "\u003cdiv\u003eHello World!\u003c/div\u003e",
			"Data" : 
				{
					"Symbol" : "AAPL"
				},				
			"Id" : "Sample",				
			"Status" : "SUCCESS"
		}]
}
```

The JSONP response format is similar, with the addition of a callback method name.

```javascript
mySampleCallbackName({
	"InlineScripts" : [],	 
	"Scripts" : [],	 
	"Styles" : [],	 
	"Apps" : [
		{
			"Html" : "\u003cdiv\u003eHello World!\u003c/div\u003e",
			"Data" : 
				{
					"Symbol" : "MSFT"
				},				
			"Id" : "Sample",				
			"Status" : "SUCCESS"
		}]
})
```

## Hosting an App

Since the Framework is web-based and it is a primary requirement of this Framework to simultaneously support multiple Apps from different providers, the following are truths:

* Anyone can technically host a Container provided they are willing to develop the infrastructure capable of supporting an app ecosystem which includes authentication, entitlements, the app store, cross-container communication (targeting version 1.3 spec), etc. See How to Develop a Container for details.
* Similarly, anyone can host an App. By definition, an App is simply a web page or web site which has a Container-accessible domain name.

The App Developer or App Provider needs to host their App on a publicly accessible Internet domain. The App should follow the "REST" model for web services. In simple terms, REST is a formal description of the HTTP protocol. Accessing a "REST" App is merely a matter of making a standard HTTP request to a defined resource.

An App can be accessed by an HTTP GET or HTTP POST request. Each request consists of a URI, and a URL encoded list of parameters in JSON. The URI consists of a hostname and base path, a method name, and an optional format specifier. The parameters are appended to the URI on the querystring.

## App Content

App Providers can determine which content they wish to make available within their App. It is recommended that content is focused on financial information; however, there is no limitation as such. Content can range from news to research to multimedia, and content should be presented using Progressive Enhancement development strategies. That is to say multimedia content, for example, should be shown plugin-free (using HTML5 video or audio elements) for capable browsers and fallback to Flash-based players for browsers that do not yet support HTML5 related technologies.

If App Providers embed URLs back to their own websites, URLs must be opened in a new window as to not interrupt the experience of someone using the Workspace. If authentication is required on App Providers’ site, this can be achieved with pass-through authentication using encrypted URLs as discussed in the Authentication API section of this specification.

## Single Sign-On

Providers participating in the Markit App Framework must modify their web sites' authentication mechanism to accept a customer’s authentication from a Container Provider without requiring the user to retype their Username and Password. With an authentication methodology in place between the Container Provider and App Provider, when a customer authenticates to a Provider’s App, the authentication credentials are passed to the Container Provider.  The authentication methodology is also suitable for the reverse, for authenticating a customer requesting content from an App Provider after selecting content from the App within the Container. Authentication information will be passed between App Providers and Container Providers in the form of encrypted URLs.

## Entitlements

User Entitlements are the responsibility of the App developer. Many apps will need to be decoupled from the content that they need. This would include apps like research aggregation, news filtering, streaming market data, etc. In order to enable an App to retrieve data from multiple, entitled, content providers in real-time, there will need to be an explicit and trusted mechanism of passing entitlements information between the Store, the data vendors, and the app developers.

Further details around entitlements will be forthcoming as this specification evolves.
