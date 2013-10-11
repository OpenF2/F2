# Added
- Q.js lib for promises
- almond.js lib for AMD shim
- underscore.js for internal utility
- F2.Interfaces for class validation

# Removed
- jQuery
- json2
- F2.log
- F2.parse
- F2.stringify
- F2.isNativeDOMNode
- F2.extend
- F2.inArray
- scriptErrorTimeout from container config

# Modified
- F2.guid: now RFC4122 compliant and doesn't vary length by browser
- F2.registerApps: renamed to `load`.
- F2.load: removed ability to pass in predefined app manifests
- F2.init: renamed to `F2.config`.
- F2.removeApp: now takes instanceId or app root