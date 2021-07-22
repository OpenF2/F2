# Extending F2

<p class="lead">At its core, F2 is an open framework. To create a truly open and flexible foundation with F2.js, F2 can be extended with custom plugins. Extending F2 with plugins provides direct access to F2.js SDK methods and can save your teams a lot of time.</p>

---

## Plugins

Now that you're comfortable with F2 and all the individual [components of the framework](about-f2.html#framework), you are ready to extend F2 and add your own custom logic in the form of an F2 plugin.

There is a [separate repository on GitHub](https://github.com/OpenF2/F2Plugins) dedicated to F2 plugin development. If you write a plugin you'd like to contribute back to the community, commit it to [F2Plugins](https://github.com/OpenF2/F2Plugins).

<a href="https://github.com/OpenF2/F2Plugins/zipball/master" class="btn btn-primary">Download F2 Plugins</a> <a href="https://github.com/OpenF2/F2Plugins/" class="btn" target="_blank">View on GitHub</a>

---

## Example Plugin

Plugins are encapsulated in JavaScript closures as demonstrated below. There are three arguments which can be passed into `F2.extend()`: `namespace`, `object`, and `overwrite`. For full details, [read the F2.js SDK documentation](../sdk/docs/classes/F2.html#method_extend).

```javascript
F2.extend(
	'YourPluginName',
	(function () {
		return {
			doSomething: function () {
				F2.log('Something has been done.');
			}
		};
	})()
);
```

To call your custom method shown above:

```javascript
...
F2.YourPluginName.doSomething();
...
```

This method call writes `Something has been done.` to the Console.

---

## Best Practices

The purpose of developing a plugin is to encapsulate clever logic in a single javascript function to save time and effort performing repetitive tasks. Here are some best practices to keep in mind:

- Always use `F2.extend()` and wrap your plugin in a closure.
- Follow the [module pattern](app-development.html#module-pattern) as shown in the example above or the [f2-storage.js example on GitHub](https://github.com/OpenF2/F2Plugins/blob/master/f2-storage.js).
- Adhere to F2's guidelines when it comes to [namespacing](app-development.html#namespacing).
- When passing options or data to the plugin, use data objects instead of _n_ arguments. Cleanliness is key.
- Don't overuse or clutter the `F2` namespace with more custom plugins than you need.

---

## Forum

Have a question? Ask it on the [F2 Google Group](https://groups.google.com/forum/#!forum/OpenF2).

<OpenF2@googlegroups.com>

---
