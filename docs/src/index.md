% F2: The Open Financial Framework

F2 is a web integration framework designed specifically for the financial markets. Its primary use is for integrating multi-party web applications into a single seamless desktop or mobile experience. It was created and is maintained by [Markit](http://markit.com). Visit [OpenF2.com](http://www.openf2.com) for more information, or continue exploring.

## Get Started

F2 is an open framework meaning anyone can build individual components or the entire product. To get container and app developers started, we've provided a JavaScript API -- called **F2.js** -- in addition to example apps as part of an [open-source project managed on GitHub](http://www.github.com/OpenF2/F2).

If you are interested in **building apps**, get started by browsing through this [technical documentation](developing-apps-with-f2.html) or [follow the project on GitHub](http://www.github.com/OpenF2/F2). If you are interested in **building containers**, browse to the [container documentation](developing-the-container.html).

## The Problems F2 Solves ##

The reasons for developing the open standard for a financial app ecosystem are simple: one does not exist today and Markit feels there is a great need. Additionally, much of the installed base of financial software is run on the desktop, which means that even if there is no physical media, there is an installation process that is difficult for users to do. By design, F2 implies a one-step installation process, direct from the Internet, with no "installed software" decisions to be made by the user. Further, the financial information industry has spent most of its history bundling content and tools into packages which include far more than most users need. Perhaps the greatest benefit of the Open Financial Framework is that – through its Catalog component – it will allow users to buy only the content or tools they need. Said plainly: If John can’t get what he wants from Overstock.com, he’s going to buy it from Amazon. And John wants the best content and the best tools so he’ll buy apps from Amazon.

**Primary Goal**

The primary goal of the Open Financial Framework standard and this specification is to provide app developers the resources they need to create apps. Developers who adhere to this standard will make it possible for multiple apps, developed independently by different organizations, to function together creating a seamless and integrated "desktop" experience.

<div class="well well-small">
<h4>About Apps</h4>
<p>The term "app", in popular web parlance, is a module or widget or component. In the Open Financial Framework, apps are small web pages and consist of HTML, CSS, JavaScript and, of course, data. They are _not_ smartphone apps built for the Apple or Android app stores. </p>
<p>This specification [furnishes app developers with JavaScript code](developing-apps-with-f2.html) which – among other things – not only allows their apps to run on the desktop but also provides APIs for communication between the container and nearby apps.</p>
</div>

## Capabilities ##

These three capabilities below form the underpinnings of F2: Open Financial Framework.

**Apps From Multiple Providers Displayed at the Same Time**

A financial app ecosystem needs to display apps (or modules of data) from multiple information providers at the same time. In order to do this, there needs to be a standard for context passing from app to app, and from the desktop to all apps. As part of the context passed to apps, app developers should expect to receive information about how their app will be displayed (width, height, authentication model, etc). 

For more information on **context**, [browse to the technical documentation](developing-apps-with-f2.html#context).

**Separation of Apps from Content**

Within Apple’s App Store, some types of content can be used by multiple apps at the same time such as iPhoto or iPod. Within the Open Financial Framework, apps need to be entitled with content like streaming Level II quotes, or be able to handle multiple sources of entitled content, like news or research aggregation.

**An App Catalog that Can Handle Several Types of Entitlements**

The App Catalog within F2 will need to handle more than just individually purchased Apps or Content (known as "entitlements"). In addition to handling cash transactions, the App Catalog will need to be able to handle entitlements granted to them by a brokerage firm, by a Yahoo! advertiser, by the App developer, or by a content provider. This Framework would make it so that a user’s purchases and entitlements can move to any desktop adhering to this standard, regardless of who is hosting the desktop.*

<small>* Not yet implemented within F2.</small>

## Building the Framework ##

If we have the goal of F2 being successful and accessible, then we have only one choice in the front-end technology we use: it has to be HTML5. 

As you may know, support for HTML5-related technologies on all desktop browsers and mobile devices is limited. Therefore, as part of F2, we chose to include [Twitter Bootstrap](http://twitter.github.com/bootstrap/) as the solution to solve many cross-browser problems allowing for faster front-end F2 app development.
