% Container Features Coming

## Search

Each Container Provider shall be responsible for implementing search functionality. Users should be able to search content specific to either a Content provider itself or the Apps as part of the Container. Taking the example of Context, Containers need to be able to allow users to search for financial content – usually starting with the symbol of an instrument.

Financial users will usually be dealing with lists of issues or individual entities. In order to share Context between apps, there will need to be a protocol for specifying the individual entities, issues, or products, as an individual item, or as a list of similar items. In order to do this, both data providers and app providers will need to use a standard and shared identification system. 

Markit’s reference data technology, or “XRef" (for symbol cross-reference), can be leveraged for this use. Web services can be made available to both App and Container developers to ensure all parties can (technically) converse about the same entities.

## Directory

A directory of financial users would be necessary in order to organize and share app store entitlements. Access to this directory could also be an App. 

Markit Directory is a centralized, cloud-based service that creates and manages a “golden record” unique ID for an individual’s profile details. The processing of profiles, administration interfaces to managing exceptions, reference data, auditing, security, privacy and extensible APIs are all components of the Directory. The Directory enables portability of identity information across security domains and will be the single source for all industry participants for profile information.

Both App and Container developers could leverage Markit Directory to share user information (as part of Context) between Apps and Containers.

## Messaging

Federated Messaging is an app that only Markit can provide by virtue of its exclusive license with NextPlane. Markit’s federated messaging App will enable any user, regardless of their firm’s instant messaging system, to monitor presence and send message to anyone else, regardless of messaging system.

