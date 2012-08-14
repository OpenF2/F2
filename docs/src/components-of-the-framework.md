# The Components of the Framework

* The Container
* The App
* The App Store
* The Developer Site

### The Container

The Container is most simply described as the user interface and the location where all Apps reside. More specifically, the Container is a web page which is “aware” of its contents (the Apps) and plays the role of a traffic cop managing Context passing between Apps. Further, the Container can have any variation of intelligence on a wide spectrum. 

Markit’s intention in standardizing the Container concept is to keep the Container as “thin” as possible (not unlike a traditional thin client).

### The Grid

Apps will be loaded onto the Container and confirm to the desktop’s Grid. The Grid is a HTML document based on a 16-column fluid layout. Users can resize their browser windows and therefore their desktops to any dimension their devices’ display supports. 

There is only one limitation when designing in App: Apps should be designed to be no narrower than 320 pixels in width (the screen width of the most popular smartphones). The Container itself will not support a resolution narrower than 320 pixels on either desktop or mobile displays. (The optimal Container resolution is 1280 pixels and ‘full screen’ is one better.) Except in the case of when an iframe is used to load an App on the Container, Apps can determine their own height on the desktop and automatically “stretch” until all content in the App is visible to the user.

### Interactions

Apps have Context. Context can be shared between other Apps (children) and the Container (parent). The Container is responsible for managing the Context passing; see “Context” for more information. 

As for interactions and user experience, the design guidelines and App API will contain information on how to provide users with a consistent presentation layer. When it comes to in-app menus or settings panes, this is crucial. 

### The App

The App is a web page or microsite, written by an App developer that includes its own (entitled) data. Further, an App can be purchased (or entitled) from the App Store, and is displayed on the desktop or “Container”. The App developer is the person or company that designs, develops, and hosts the app.

Simplistically, an App is one of two things:

* Presentation App	A presentation App is an HTML document and contains JavaScript, cascading style sheets, images and other objects. It displays data to users in a manner determined by the App designer and must adhere to this specification.
* Data App	A data app is a content feed available in industry-standard formats including JSON, JSONP, RSS or App-defined XML.

### App Context

Regardless of type of app, a presentation or data App has “context” – that is to say an App “knows” about who is viewing it and its content. It is aware of a specific user’s data entitlements as well as information about the user (name, email, company, etc). Additionally, the App is capable of sharing Context with the Container and nearby Apps. This means if Susan wants to create a ticker-focused workspace so she can watch her Apple stock decline in value during Apple’s next product event, the Container can send “symbol context” to Apps and the Apps will be smart enough to refresh focusing on AAPL.

### Creating a Common Look and Feel

In designing an App, app designers and developers should follow the Responsive Web Design Methodology. At a high level, this allows Apps to be flexible on both desktop and mobile workspaces. Wikipedia defines Responsive Web Design (RWD) as “a web site [that] is crafted to use CSS3 media queries, an extension of the @media rule, with fluid proportion-based grids, to adapt the layout to the viewing environment, and probably also use flexible images. As a result, users across a broad range of devices and browsers will have access to a single source of content, laid out so as to be easy to read and navigate with a minimum of resizing, panning, and scrolling.”

Further, when considering App design, “’Mobile First’ and ‘Progressive Enhancement/Unobtrusive JavaScript’ are related concepts that predated RWD: browsers of basic mobile phones do not understand media queries or JavaScript, and it is wise to create a basic web site then enhance it for smart phones and PCs — rather than attempt "graceful degradation" to try to degrade a complex, image-heavy site to work on the most basic mobile phones.”

Using the Open Financial Framework’s upcoming design guidelines and App API, App Designers and Developers can take advantage of these available resources to develop Apps on their own schedules. The design guidelines will provide a common theme and offer a baseline for consistency between all Apps on the Container. 

### The App API

Markit is developing App APIs, to provide App design and development teams (as well as Container providers) the tools, concepts and best practices needed to produce high-quality Apps.

In releasing the open App API, the goal is to provide:

* Technical documentation on how to build and deploy Apps, how Apps are consumed by Containers, how to build and host Containers, and more.
* Design standards and recommendations for App and Container designers.
* Articles highlighting best practices and concepts for App and Container developers
* Getting-started references and sample code 

### The App Store

The App Store is the place where a user selects (or purchases) either a presentation or data App. Customers will be able to buy an app by using an electronic payment mechanism, like a credit card, but they will also be able to charge their company, or be entitled by a vendor or through another business relationship. Since the App Store is where it all begins, the term is usually used as a substitute for “App Community”.

### The Developer Center

The Open Financial Framework specification will be published on a website featuring Framework documentation, App developer resources and sample Apps. This site, known as the Developer Center, will be a web site where all of the resources for App and Container developers can be found. This includes the App APIs which will provide App design and development teams (as well as Container providers) the tools, concepts and best practices needed to produce high-quality Apps.

In addition, a key part of the Developer Center will be the ability for App developers to manage their Apps, register their Apps with Container Providers, issue App updates, and more.
