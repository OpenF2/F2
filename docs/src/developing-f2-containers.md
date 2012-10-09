% Developing F2 Containers

<p class="lead">To understand how F2 Containers work or to get started building a Container, you've come to the right place. If you have not yet cloned the F2 repo on GitHub or downloaded the latest build, you should do that now by reading the [quick start guide](https://github.com/OpenF2/F2#quick-start).</p>

## The Container

To understand F2 and the role of Apps, you need to understand the role of the **Container**.

![](./img/wwp_devices.png "Containers and Apps on desktop and mobile")

The F2 Container is a web page that is "aware" of its contents (the Apps) and plays the role of a traffic cop managing context passing between F2 Apps (when more than one exists in a Container). It is also the layer between the browser and Apps, and the location where Apps reside.

A Container can have any variation of intelligence on a wide spectrum which means it can provide data in-memory or via web services to Apps or simply host the [F2.js JavaScript SDK](https://github.com/OpenF2/F2/blob/master/sdk/f2.min.js). It is multi-channel so it can deliver capabilities via the Internet to desktops, tablets and smartphones.

Each Container Provider, or person or company hosting a Container, is responsible for including the F2 JavaScript SDK. The SDK (F2.js) provides a consistent means for all App developers to load their apps on any container regardless of where it is hosted, who developed it, or what back-end stack it uses.

Read [more about The Container](index.html#framework) and the F2 Framework.

### Get Started

To help you get started, you will find a basic container in the [project repo on GitHub](https://github.com/OpenF2/F2/tree/master/examples/container/) along with a number of sample apps. Once you open the project repository, point your browser at:

`http://localhost/F2/examples/container/`

#### Configuration

It is assumed you will be developing a F2 Container locally and have a `localhost` setup. The URLs mentioned in this specification assume you have configured your F2 Container and Apps to run at `http://localhost/F2/`. The examples provided as part of the project repository demonstrate apps written in different languages (PHP, JavaScript, C#). While it is not a requirement you have a web server configured on your computer, it will certainly allow you to more deeply explore the sample apps.

**Ready to start coding?** [Jump to Developing a F2 Container](#developing-a-f2-container).

* * * *

## F2 Containers


## Developing a F2 Container

### Container ID
### Customizing
#### CSS
##### Namespacing
#### JavaScript
##### Namespacing

## Container Config
### F2 UI Mask

## Registering Apps
## Secure Apps
## Context
### Events

## Utils
### Get Container State
### IsInit
### RemoveAllApps
### RemoveApp

## F2 UI

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
