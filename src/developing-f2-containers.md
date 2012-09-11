% Developing the Container

## The Container

The Container is most simply described as the user interface and the location where all Apps reside. More specifically, the Container is a web page which is “aware” of its contents (the Apps) and plays the role of a traffic cop managing Context between Apps. Further, the Container can have any variation of intelligence on a wide spectrum. 

Markit’s intention in standardizing the Container concept is to keep the Container as “thin” as possible not unlike a traditional thin client. Wikipedia describes a “thin client” as “a computer or a computer program which depends heavily on some other computer (its server) to fulfill its traditional computational roles. This stands in contrast to the traditional fat client, a computer designed to take on these roles by itself. The exact roles assumed by the server may vary, from providing data persistence to actual information processing on the client's behalf.

“Thin clients occur as components of a broader computer infrastructure, where many clients share their computations with the same server. As such, thin client infrastructures can be viewed as the providing of some computing service via several user-interfaces. This is desirable in contexts where individual fat clients have much more functionality or power than the infrastructure either requires or uses.”

## Context

Each Container Provider shall be responsible for hosting the Container JavaScript API. This JavaScript framework provides a consistent means for all App Developers to load their Apps on any Container.

While Apps can have context themselves, the responsibility for managing Context switching or Context passing falls on the Container. The Container assumes the role of a traffic cop – managing what data goes where. Using an Event Emitter, the Container can “listen” for events sent by Apps on configurable intervals.

This is a sample of a Container sending Context to Apps. 

```javascript
Container.on(“SendContext”, { Symbol: “MSFT” });
```

Apps on the Container can optionally listen for broadcasted messages or events and respond accordingly.

```javascript
$(“myApp”).bind(“SendContext”, function(ev,data){
	myApp.refresh();
});
```

Container developers do not need to worry about how to “receive” Context sent from Apps; this logic is handled as part of the Markit-provided Container API.

## How to Develop a Container

A Container is most simply described as a web page; therefore developing Containers can be as simple or complex as the Container developer chooses. Markit is developing a Container API which will manage Context on the workspace. Additionally, it will provide App developers an Application Programming Interface, or API, for advanced Container features such as a drag-and-drop, app management (add new apps, remove existing apps), etc.

The simplest implementation of a Container looks like this:

```html
<!DOCTYPE html>
<html>
	<head>
		<title>Markit Container</title>
		<meta name="X-UA-Compatible" content="IE=edge,chrome=1" />
		<meta name="viewport" content="device-width" />
		<script src="http://dev.domain.com/ResourceManager/modernizr.js"></script>
		<!--[if IE]>
		<script src="http://dev.domain.com/ResourceManager/html5shiv.js"></script>
		<![endif]-->
	</head>
	<body>
		
		<script src="http://dev.domain.com/Container.js?1.0"></script>
	</body>
</html>
```

In developing an advanced Container, the HTML document’s body element would contain additional markup and allow for specific positioning or placement of Apps. Such an example might look like this:

```html
<!DOCTYPE html>
<html>
	<head>
		<title>Markit Container</title>
		<meta name="X-UA-Compatible" content="IE=edge,chrome=1" />
		<meta name="viewport" content="device-width" />
		<script src="http://dev.domain.com/ResourceManager/modernizr.js"></script>
		<!--[if IE]>
		<script src="http://dev.domain.com/ResourceManager/html5shiv.js"></script>
		<![endif]-->
	</head>
	<body>
		<header>
			<nav>
				<a href=”/home”>Home</a>
			</nav>
		</header>
		<section>
			<h1>Markets Overview</h1>
			<div id=”destinationApp1”></div>
		</section>
		<footer>
			&copy; 2012 Markit.
		</footer>
		<script src="http://dev.domain.com/Container.js?1.0"></script>
		<script src='http://app.provider.com/App/Factory/script?params=%5B%7B%22Id%22%3A%22Hello%20World%22%2C%22DestinationElement%22%3A%22destinationApp1%22%7D%5D'></script>
	</body>
</html>
```

You may notice the App embedded in the above example has querystring “params”. The decoded params value is:

`
?params=[{"Id":"Hello World","DestinationElement":"destinationApp1"}]
`

This params object only demonstrates an example for a Container. For a full explanation on Params and all their possible values, refer to “How to Develop an App” in this specification.

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

