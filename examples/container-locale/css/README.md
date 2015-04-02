# Namespaced CSS

F2 Containers can (and should) namespace their CSS so that the Container and Apps can run separately from any other CSS on the page. You could namespace your CSS by:

```css
.f2-example-container {
	@import "bootstrap/bootstrap.less";
	@import "your-custom-css.less";
}
```