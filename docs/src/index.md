% F2: An open framework created for the financial services industry.

<p class="lead">F2 is an open and free web integration framework that has been designed to help you develop custom solutions that combine the best tools and content from multiple providers into one, privately-labeled, seamlessly integrated front-end.</p>

The [essential components](components-of-the-framework.html) defined by the F2 specification are the [Container](developing-f2-containers.html), [Apps](developing-f2-apps.html), [Context](developing-f2-apps.html#context) and [Store](#)&mdash;all supported under the hood by **F2.js**, a JavaScript SDK which provides an extensible foundation powering all F2-based web applications. 

F2 was started by and is maintained by [Markit On Demand](http://www.markitondemand.com). Visit [OpenF2.com](http://www.openF2.com) for more information.

## Get Started

F2 is an open framework meaning anyone can build individual components or the entire product. To get Container and App developers started, there is a JavaScript SDK&mdash;called **F2.js**&mdash;in addition to example apps as part of an [open-source project maintained on GitHub](http://www.github.com/OpenF2/F2).

If you are interested in **building Apps**, get started by browsing through this technical documentation or follow the project on GitHub. If you are interested in **building Containers**, browse to the [Container documentation](developing-f2-containers.html).

<div class="well well-small">
<h4>About Apps</h4>
<p>The term "app", in popular web parlance, is a program that runs on your smartphone or tablet. In the Open Financial Framework, apps are small web pages and consist of HTML, CSS, JavaScript and, of course, data. They are _not_ smartphone apps built for the Apple, Android or BlackBerry app stores. You should think of F2 Apps as modules, widgets or components.</p>
<p>This specification [furnishes app developers with JavaScript code](developing-f2-apps.html) (the F2.js SDK) which&mdash;among other things&mdash;not only allows their apps to run on the Container but also provides APIs for communication between the Container and nearby Apps.</p>
</div>

<a href="developing-f2-apps.html" class="btn btn-primary">Get Started Building Apps <i class="icon-arrow-right icon-white"></i></a>

#### Markit Developers

<span class="label label-info">TEMPORARY</span> This information is temporary and will be removed prior to 1.0.0 launch.

Prior to public release 1.0.0, we are asking for Markit developers to help collaborate by **building apps**. If you have any questions that aren't answered here, you can get help.

<p>
	<a href="mailto:BLD-F2TechnicalTeam@markit.com" class="btn btn-small"><i class="icon-envelope"></i> Email the F2 Team</a>
	<a href="https://groups.google.com/forum/#!forum/openf2" class="btn btn-small" data-title="Send your Google Account name to Mark Healey for an invite." rel="tooltip"><i class="icon-tasks"></i> Subscribe to the Google Group</a> 
</p>

* * * *

## The F2 Goal

The primary goal of this F2 specification is to provide App and Container developers the resources they need to create F2. Developers who adhere to this standard will make it possible for multiple apps, developed independently by different organizations, to function together creating a seamless and integrated experience.

### The Problems F2 Solves 

Several fundamental problems are common to the financial services industry. Everyone is looking for ways to solve them quickly and efficiently.

<table class="table table-bordered">
	<thead>
		<tr>
			<th nowrap>Industry Problem</th>
			<th>Description</th>
			<th>F2 Solution</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td nowrap>Monolithic Systems</td>
			<td>Monolithic, installed code bases that are closed and expensive to enhance.  When a “redesign” occurs on this type of platform, it’s usually a do-over, from the ground-up. Integration is difficult.</td>
			<td>Nimble, modern use of internet-delivery with a multi-vendor approach.  Standardized framework used by all parties.  Cost-effective and shorter development cycles.</td>
		</tr>
		<tr>
			<td>Big Bang</td>
			<td>Big Bang approaches stifle innovation and require significant investment in the integration of legacy systems.  Buy-in from many stakeholders is essential and difficult to manage.  Entire platforms must be redeveloped in order to make cut-overs.  There are more bugs and problems at launch and unhappy  users. </td>
			<td>In the F2 environment  you will be able to compete on features. It is easy to progressively make changes, enhancements, onboard new applications, switch content providers with little risk and migrate users and tools to the platform gradually as time and resources allow. Containers may also host previous versions of websites and Apps to further simplify migration.</td>
		</tr>
		<tr>
			<td>Single Channel</td>
			<td>Separate projects, budgets and teams for web sites, tablets and hand-held devices. </td>
			<td>The F2 specification describes how to develop one framework that can be managed to many devices.</td>
		</tr>
		<tr>
			<td>Security</td>
			<td>Security concerns are a major reason firms worry about switching vendors or to a new technology.</td>
			<td>F2 can entitle Apps without passing sensitive client information to a third party App provider. This multi-provider solution is more secure and less vulnerable than single-provider solutions.</td>
		</tr>
		<tr>
			<td>Over-provisioning</td>
			<td>Over-provisioning of content happens frequently. It is expensive to pay for content that no one is using. This probably happens because it is difficult.</td>
			<td>The F2 spec makes it easy to turn on or off entitlements as often as may be required.</td>
		</tr>
</table>

* * * *

## Building the Framework 

If we have the goal of F2 being successful and accessible, then we have only one choice in the front-end technology we use: it has to be HTML5. Using the [progressive enhancement](http://www.alistapart.com/articles/understandingprogressiveenhancement/) methodology in designing and developing F2, we've been focused on starting with a rock-solid foundation. The F2 open standard provides guidelines for app and container devleopers alike to add feature enhancements targeting specific environments or visitors. For example, F2 apps can be built following the [mobile first](http://www.lukew.com/presos/preso.asp?26) design approach and with [responsive CSS](http://twitter.github.com/bootstrap/scaffolding.html#responsive), users could access a container on their desktop, tablet or smartphone all while app devlelopers only need to build a single app.

As you may know, [support for HTML5-related technologies](http://findmebyip.com/litmus/) on _all_ desktop browsers and mobile devices is limited. Therefore, as part of F2, to augment the work we've done, we chose to include some third-party web development libraries to bridge those gaps. Why reinvent the wheel, right? 

F2 uses and recommends [Twitter Bootstrap](http://twitter.github.com/bootstrap/) for a consistent HTML & CSS structure for app development _regardless of app developer_ ([we'll explain more later](developing-f2-apps.html#designing-the-app-to-look-integrated-with-the-container)). F2 relies on data structures represented in JSON, so we've included Crockford's [JSON](http://www.json.org/). Finally, to support a secured container environment, F2 needs cross-domain in-browser messaging. For this, we turned to [easyXDM](http://easyxdm.net/wp/).

As either an app developer or a container developer, it's helpful to know these third-party libraries are included in F2. But it's more important to know the F2.js JavaScript SDK provides a consistent interface and easy-to-use API so you don't have to think about it.

**Ready to get started building apps?**

<p>
	<a href="developing-f2-apps.html" class="btn btn-primary">Get started</a>
	<a href="http://www.github.com/OpenF2/F2/" class="btn">Fork GitHub project</a>
</p>
