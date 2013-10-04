# Added
- Q.js lib for promises
- almond.js lib for AMD shim
- underscore.js for internal utility

# Removed
- jQuery
- json2
- F2.log
- F2.parse
- F2.stringify
- F2.isNativeDOMNode
- F2.extend
- F2.inArray

# Modified
- F2.guid: now RFC4122 compliant and doesn't vary length by browser
- F2.registerApps: now called `load`.
- F2.load: removed ability to pass in predefined app manifests