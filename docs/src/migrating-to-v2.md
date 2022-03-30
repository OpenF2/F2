# Migrating to v2

## Secure Apps

In v1, F2 had the idea of "Secure Apps" where apps were loaded into iFrames in
order to isolate them from the parent page. This feature added a lot of
complexity and bloat to the codebase and was a feature that was unused in
practice. For v2, this feature has been removed.

## F2.UI

F2 v1 provided some UI utility methods in the `F2.UI` namespace. These utilities
provided for things like loading spinners, modals, and multiple "views" for an
app. These features were built using jQuery, jQuery UI, and Bootstrap and were
largely unused. In v2, these features have been removed.

## jQuery, jQuery UI, Bootstrap

v1 of F2 utilized jQuery for DOM manipulation. v2 utilizes native javascript or
[domify](https://github.com/component/domify) instead. In addition to jQuery,
jQuery UI and Bootstrap were bundled inside of F2 (in a closure). These extra
libraries were utilized for `F2.UI`. For v2, all of these libraries were removed
greatly reducing the overall file size and security posture of F2.

## Deprecated Functionality

In addition to the updates mentioned previously, there were parts of F2 v1 that
were marked as deprecated. These parts have been removed in v2. For example, the
`beforeAppRender`, `appRender`, `afterAppRender` callbacks that were replaced by
`F2.AppHandlers` had been deprecated and now removed.
