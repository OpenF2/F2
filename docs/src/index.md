% F2: The Open Financial Frameworkkkkk

The Open Financial Framework, designed and developed by Markit, is an open standard for a web application framework that is specifically designed for the financial markets. This specification enables multiple information providers to entitle both apps and content to be combined in a seamless experience. 

## The Problem We Are Trying to Solve ##

The reasons for developing the open standard for a financial app ecosystem are simple: one does not exist today and Markit feels there is a great need. Additionally, much of the installed base of financial software is run on the desktop, which means that even if there is no physical media, there is an installation process that is difficult for users to do. By design, this Open Financial Framework implies a one-step installation process, direct from the Internet, with no "installed software" decisions to be made by the user. Further, the financial information industry has spent most of its history bundling content and tools into packages which include far more than most users need. Perhaps the greatest benefit of the Open Financial Framework is that – through its Store component – it will allow users to buy only the content or tools they need. Said plainly: If John can’t get what he wants from Microsoft, he’s going to buy it from Apple. And John wants the best content and the best tools so he’ll buy apps from Apple.

The primary goal of the Open Financial Framework standard and this specification is to provide App developers the resources they need to create apps. Developers who adhere to this standard will make it possible for multiple apps, developed independently by different organizations, to function together creating a seamless and integrated “desktop" experience.

Note:

The term “App", in popular web parlance, is a module or widget or component. In the Open Financial Framework, Apps are small web pages and consist of HTML, CSS, JavaScript and, of course, data. This specification furnishes App developers with JavaScript code which – among other things – not only allows their Apps to run on the desktop but also provides APIs for communication between the desktop and nearby Apps. 
As an extension, these main goals below form the underpinnings of the Open Financial Framework.

## Capabilities ##

* Apps From Multiple Providers Displayed at the Same Time
	* A financial app ecosystem needs to display apps (or modules of data) from multiple information providers at the same time. In order to do this, there needs to be a standard for context passing from app to app, and from the desktop to all apps. As part of the context passed to Apps, App developers should expect to receive information about how their App will be displayed (width, height, etc.).
* Separation of Apps from Content
	* Within Apple’s iTunes Store, some types of content can be used by multiple apps at the same time such as iPhoto or iPod. Within the Open Financial Framework, Apps need to be entitled with content like streaming Level II quotes, or able to handle multiple sources of entitled content, like a news or research aggregation app.
* An App Store that can handle several types of entitlements
	* The App Store within the Open Financial Framework will need to handle more than just individually purchased Apps or Content (known as “entitlements”). In addition to handling cash transactions, the App Store will need to be able to handle entitlements granted to them by a brokerage firm, by a Yahoo! advertiser, by the App developer, or by a content provider. This Framework would make it so that a user’s purchases and entitlements can move to any desktop adhering to this standard, regardless of who is hosting the desktop.

## Who Loses & Who Wins ##

App developers will focus their time, talents, and resources on creating apps for the App community that they believe will give them the largest return. By making this standard, the desktop providers guarantee that no single desktop provider will win the race to become the most attractive marketplace for App developers. The desktop providers also guarantee that they won’t lose.  Many desktop or platform providers, like Markit, will also be App developers. In Markit’s case, what it doesn’t get by trying to win the race for the most compelling App community, it would win by having a larger market for its own apps.

## Building the Framework ##

If we have the goal of the Framework being successful and accessible, then we have only one choice in the technology we use: it has to be HTML5. 


*Support for HTML5 related technologies on all mobile devices are limited. The future mobile landscape is a three horse race between Apple, Google and Microsoft. Apple’s iPhone and iPad are leaders in HTML5 support, while Samsung’s newest devices built for Google’s Android OS are a close second. Microsoft’s new mobile devices, including the Surface tablet, have feature support, too. 
