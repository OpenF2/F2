# Containers & Apps

## Overview

The diagram below depicts the world’s simplest Container – look at all those grey boxes! The purpose of this picture is to demonstrate an App’s relationship with a Desktop and in turn the Container. What is not shown here is the user’s browser chrome.

### INSERT DIAGRAM

As you can see, the Container is nothing without Apps. Similarly, the Apps have no home without the Container. It is imperative they work together and appear seamless to users.

“Okay,” you say, “who hosts all these grey boxes?” Great question.

## Hosting
Since the Framework is web-based and it is a primary requirement of this Framework to simultaneously support multiple Apps from different providers, the following are truths:

* Anyone can technically host a Container provided they are willing to develop the infrastructure capable of supporting an app ecosystem which includes authentication, entitlements, the app store, cross-container communication (targeting version 1.3 spec), etc. See How to Develop a Container for details.
* Similarly, anyone can host an App. By definition, an App is simply a web page or web site which has a Container-accessible domain name.

## Container Providers and App Developers

In designing the Open Financial Framework, an important consideration was maintaining a separation between Container Providers and App Developers. Therefore, after App developers register their Apps with Container Providers, Containers automatically consume Apps using the Container APIs. App Developers have as much or as little information (as App Context allows) about where their App exists at any given moment in time. 

## Usage Reporting

App developers are encouraged to leverage their own or third party tools for capturing usage metrics or other MIS. App developers will not have access to Container Provider-owned usage analytics unless it is pre-agreed upon between the two parties.