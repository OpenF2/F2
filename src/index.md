% F2: The Open Financial Framework

<p class="lead">F2, an open web integration framework, defines how to develop custom solutions that combine the best tools and content from multiple providers into one, privately-labeled, seamlessy integrated front-end.  The [essential components](components-of-the-framework.html) of F2 are all supported under the hood by F2.js, a JavaScript SDK which provides an extensible foundation powering all F2-based web applications.</p>

F2 was created and is maintained by [Markit](http://www.markit.com). Visit [OpenF2.com](http://www.openf2.com) for more information.

## Get Started

F2 is an open framework meaning anyone can build individual components or the entire product. To get container and app developers started, we've provided a JavaScript SDK&mdash;called **F2.js**&mdash;in addition to example apps as part of an [open-source project maintained on GitHub](http://www.github.com/OpenF2/F2).

If you are interested in **building apps**, get started by browsing through this technical documentation or follow the project on GitHub. If you are interested in **building containers**, browse to the [container documentation](developing-the-container.html).

<a href="developing-f2-apps.html" class="btn btn-primary">Get Started Building Apps <i class="icon-arrow-right icon-white"></i></a>

#### Markit Developers

Prior to public release 1.0.0, we are asking for Markit developers to help collaborate by **building apps**. If you have any questions that aren't answered here, you can get help.

<p>
	<a href="mailto:BLD-F2TechnicalTeam@markit.com" class="btn btn-small"><i class="icon-envelope"></i> Email the F2 Team</a>
	<a href="https://groups.google.com/forum/#!forum/openf2" class="btn btn-small" data-title="Send your Google Account name to Mark Healey for an invite." rel="tooltip"><i class="icon-tasks"></i> Subscribe to the Google Group</a> 
</p>

* * * *

## What is F2?

F2 is a web integration framework designed specifically for the financial markets. Its primary use is for integrating multi-party web applications into a single seamless desktop or mobile experience.

### Primary Goal

The primary goal of the Open Financial Framework specification, and by extension this technical documentation, is to provide app and container developers the resources they need to create F2. Developers who adhere to this standard will make it possible for multiple apps, developed independently by different organizations, to function together creating a seamless and integrated "desktop" experience _(the container)_.

### The Problems F2 Solves 

The reasons for developing the open standard for a financial app ecosystem are simple: one does not exist today and Markit feels there is a great need. Additionally, much of the installed base of financial software is run on the desktop, which means that even if there is no physical media, there is an installation process that is difficult for users to do. By design, F2 implies a one-step installation process, direct from the Internet, with no "installed software" decisions to be made by the user. Further, the financial information industry has spent most of its history bundling content and tools into packages which include far more than most users need. Perhaps the greatest benefit of the Open Financial Framework is that&mdash;through its Catalog component&mdash;it will allow users to buy only the content or tools they need. Using an example: If John can’t get what he wants from Overstock.com, he’s going to buy it from Amazon. And John wants the best content and the best tools so he’ll buy apps from Amazon.

<div class="well well-small">
<h4>About Apps</h4>
<p>The term "app", in popular web parlance, is a program that runs on your smartphone or tablet. In the Open Financial Framework, apps are small web pages and consist of HTML, CSS, JavaScript and, of course, data. They are _not_ smartphone apps built for the Apple, Android or BlackBerry app stores. You could think of a F2 app as a module or widget or component.</p>
<p>This specification [furnishes app developers with JavaScript code](developing-f2-apps.html) (the F2.js SDK) which&mdash;among other things&mdash;not only allows their apps to run on the desktop but also provides APIs for communication between the container and nearby apps.</p>
</div>

### Capabilities

While there are many goals and features, these three capabilities below form the underpinnings of F2.

**Apps From Multiple Providers Displayed at the Same Time**

A financial app ecosystem needs to display apps (or modules of data) from multiple information providers at the same time. In order to do this, there needs to be a standard for context passing from app to app, and from the desktop to all apps. As part of the context passed to apps, app developers should expect to receive information about how their app will be displayed (width, height, authentication model, etc). _For more information on **context**, [browse to the technical documentation](developing-f2-apps.html#context)._

**Separation of Apps from Content**

Within Apple’s App Store, some types of content can be used by multiple apps at the same time such as iPhoto or iPod. Within the Open Financial Framework, apps need to be entitled with content like streaming Level II quotes, or be able to handle multiple sources of entitled content, like news or research aggregation.

**An App Catalog that Can Handle Several Types of Entitlements**

The App Catalog within F2 will need to handle more than just individually purchased Apps or Content (known as "entitlements"). In addition to handling cash transactions, the App Catalog will need to be able to handle entitlements granted to them by a brokerage firm, by a Yahoo! advertiser, by the App developer, or by a content provider. This Framework would make it so that a user’s purchases and entitlements can move to any desktop adhering to this standard, regardless of who is hosting the desktop.*

<small><i>* Not yet implemented within F2.</i></small>

* * * *

## Building the Framework 

If we have the goal of F2 being successful and accessible, then we have only one choice in the front-end technology we use: it has to be HTML5. Using the [progressive enhancement](http://www.alistapart.com/articles/understandingprogressiveenhancement/) methodology in designing and developing F2, we've been focused on starting with a rock-solid foundation. The F2 open standard provides guidelines for app and container devleopers alike to add feature enhancements targeting specific environments or visitors. For example, F2 apps can be built following the [mobile first](http://www.lukew.com/presos/preso.asp?26) design approach and with [responsive CSS](http://twitter.github.com/bootstrap/scaffolding.html#responsive), users could access a container on their desktop, tablet or smartphone all while app devlelopers only need to build a single app.

As you may know, [support for HTML5-related technologies](http://findmebyip.com/litmus/) on _all_ desktop browsers and mobile devices is limited. Therefore, as part of F2, to augment the work we've done, we chose to include some third-party web development libraries to bridge those gaps. Why reinvent the wheel, right? 

F2 uses and recommends [Twitter Bootstrap](http://twitter.github.com/bootstrap/) for a consistent HTML & CSS structure for app development _regardless of app developer_ ([we'll explain more later](developing-f2-apps.html#designing-the-app-to-look-integrated-with-the-container)). F2 relies on data structures represented in JSON, so we've included Crockford's [JSON](http://www.json.org/). Finally, to support a secured container environment, F2 needs cross-domain in-browser messaging. For this, we turned to [easyXDM](http://easyxdm.net/wp/).

As either an app developer or a container developer, it's helpful to know these third-party libraries are included in F2. But it's more important to know the F2.js JavaScript SDK provides a consistent interface and easy-to-use API for app and container developers.

**Ready to get started building apps?**

<p>
	<a href="developing-f2-apps.html" class="btn btn-primary">Get started</a>
	<a href="http://www.github.com/OpenF2/F2/" class="btn">Fork GitHub project</a>
</p>
