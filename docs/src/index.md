% F2: The Open Financial Framework

<p class="lead">F2 is a web integration framework designed specifically for the financial markets. Its primary use is for integrating multi-party web applications into a single seamless desktop or mobile experience. It was created and is maintained by [Markit](http://markit.com). Visit [OpenF2.com](http://www.openf2.com) for more information or continue reading.</p>

## Get Started

F2 is an open framework meaning anyone can build individual components or the entire product. To get container and app developers started, we've provided a JavaScript SDK &mdash; called **F2.js** &mdash; in addition to example apps as part of an [open-source project maintained on GitHub](http://www.github.com/OpenF2/F2).

If you are interested in **building apps**, get started by browsing through this technical documentation or follow the project on GitHub. If you are interested in **building containers**, browse to the [container documentation](developing-the-container.html).

<p>
	<a href="developing-apps-with-f2.html" class="btn btn-primary">Get started</a>
	<a href="//www.github.com/OpenF2/F2/" class="btn">View GitHub project</a>
</p>

### Markit Developers

Prior to public release 1.0.0, we are asking for Markit developers to help collaborate by **building apps**. If you have any questions that aren't answered here, you can get help.

<p>
	<a href="mailto:BLD-F2TechnicalTeam@markit.com" class="btn"><i class="icon-envelope"></i> Email the F2 Team</a>
	<a href="https://groups.google.com/forum/#!forum/openf2" class="btn"><i class="icon-tasks"></i> Subscribe to the Google Group</a> <small><i>Send your Google Account name to <a href="mailto:mark.healey@markit.com">mark.healey@markit.com</a> for an invite.</i></small>
</p>

* * * *

## The Problems F2 Solves ##

The reasons for developing the open standard for a financial app ecosystem are simple: one does not exist today and Markit feels there is a great need. Additionally, much of the installed base of financial software is run on the desktop, which means that even if there is no physical media, there is an installation process that is difficult for users to do. By design, F2 implies a one-step installation process, direct from the Internet, with no "installed software" decisions to be made by the user. Further, the financial information industry has spent most of its history bundling content and tools into packages which include far more than most users need. Perhaps the greatest benefit of the Open Financial Framework is that – through its Catalog component – it will allow users to buy only the content or tools they need. Said plainly: If John can’t get what he wants from Overstock.com, he’s going to buy it from Amazon. And John wants the best content and the best tools so he’ll buy apps from Amazon.

**Primary Goal**

The primary goal of the Open Financial Framework specification, and by extension this technical documentation, is to provide app and container developers the resources they need to create F2. Developers who adhere to this standard will make it possible for multiple apps, developed independently by different organizations, to function together creating a seamless and integrated "desktop" experience _(the container)_.

<div class="well well-small">
<h4>About Apps</h4>
<p><p>The term "app", in popular web parlance, is a program that runs on your smartphone or tablet. In the Open Financial Framework, apps are small web pages and consist of HTML, CSS, JavaScript and, of course, data. They are _not_ smartphone apps built for the Apple, Android or BlackBerry app stores. You could think of a F2 app as a module or widget or component.</p></p>
<p>This specification [furnishes app developers with JavaScript code](developing-apps-with-f2.html) which&mdash;among other things&mdash;not only allows their apps to run on the desktop but also provides APIs for communication between the container and nearby apps.</p>
</div>

* * * *

## Capabilities ##

While there are many goals and features, these three capabilities below form the underpinnings of F2.

**Apps From Multiple Providers Displayed at the Same Time**

A financial app ecosystem needs to display apps (or modules of data) from multiple information providers at the same time. In order to do this, there needs to be a standard for context passing from app to app, and from the desktop to all apps. As part of the context passed to apps, app developers should expect to receive information about how their app will be displayed (width, height, authentication model, etc).

_For more information on **context**, [browse to the technical documentation](developing-apps-with-f2.html#context)._

**Separation of Apps from Content**

Within Apple’s App Store, some types of content can be used by multiple apps at the same time such as iPhoto or iPod. Within the Open Financial Framework, apps need to be entitled with content like streaming Level II quotes, or be able to handle multiple sources of entitled content, like news or research aggregation.

**An App Catalog that Can Handle Several Types of Entitlements**

The App Catalog within F2 will need to handle more than just individually purchased Apps or Content (known as "entitlements"). In addition to handling cash transactions, the App Catalog will need to be able to handle entitlements granted to them by a brokerage firm, by a Yahoo! advertiser, by the App developer, or by a content provider. This Framework would make it so that a user’s purchases and entitlements can move to any desktop adhering to this standard, regardless of who is hosting the desktop.*

<small><i>* Not yet implemented within F2.</i></small>

* * * *

## Building the Framework ##

If we have the goal of F2 being successful and accessible, then we have only one choice in the front-end technology we use: it has to be HTML5. 

As you may know, support for HTML5-related technologies on all desktop browsers and mobile devices is limited. Therefore, as part of F2, we chose to include [Twitter Bootstrap](http://twitter.github.com/bootstrap/) as the solution to solve many cross-browser problems allowing for faster front-end F2 app development.