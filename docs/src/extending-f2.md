% Extending F2

<p class="lead">At its core, F2 is an open framework. To create a truly open and flexible foundation with F2.js (version 1.0.0), F2 can be extended with custom plugins. Extending F2 with plugins provides direct access to F2.js SDK methods and can save your teams a lot of time.</p>

### Plugins

<span class="label label-warning">EDITOR'S NOTE</span> Need content.

### Example Plugin

Plugins are encapsulated in JavaScript closures as demonstrated below. There are three arguments which can be passed into `F2.extend()`: `namespace`, `object`, and `overwrite`. For full details, [read the F2.js SDK documentation](../sdk/docs/classes/F2.html#method_extend). 

```javascript
F2.extend('YourPluginName', (function(){
	return {
		doSomething: function(){
			F2.log("Something has been done.");
		}
	};
})());
```

To call your custom method shown above:

```javascript
...
F2.YourPluginName.doSomething();
...
```

This method call writes `Something has been done.` to the Console. 