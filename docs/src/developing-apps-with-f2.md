# Developing an App Using the Open Financial Framework

## Overview

An App is a web page or microsite, written by an App developer that includes its own (entitled) data. Further, an App can be purchased (or entitled) from the App Store, and is displayed on the desktop or “Container”. The App developer is the person or company that designs, develops, and hosts the app.

Simplistically, an App is one of two things:

* Presentation App -- A presentation App is an HTML document and contains JavaScript, CSS, images and other objects. It displays data to users in a manner determined by the App designer and must adhere to this specification.
* Data App -- A data app is a content feed available in industry-standard formats including JSON, JSONP, RSS or App developer-designed XML.

## Relationship Between Container and App

Refer to “Together At Last: Containers and Apps”.

## Development Requirements 

**Editor’s note:** Marry with jsdocs temporarily located at: 

<http://wksbbakerw7.wsod.local/internal/openfinancialframework/SDK/jsdoc/symbols/F2.Container.AppContext.html>

Each App must have a digital signature or unique identifier in the format of a GUID. This allows App Providers to register their App with the App Store and in turn the App Store can provide reporting metrics on App usage, purchases, etc. Additionally, having a unique ID allows the Container to interact with specific modules on the desktop using Context or in more simple cases using JavaScript’s document.getElementById() method.

Beyond a unique ID, Apps have other characteristics that define them within the Framework. The following are required attributes App developers must include in their Apps. The following data points should be represented within the presentation or data App:

```javascript
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
