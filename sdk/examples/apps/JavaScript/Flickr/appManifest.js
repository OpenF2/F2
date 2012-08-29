/* 
 * Callback function name must include "appId" as configured by Container 
 * 
 * Couple things 
 *    - InstanceID is hard-coded twice in this file. Not great.
 *    - Would be great if InlineScripts were legible
 *    - Same with Apps.HTML
 *
 */
F2_jsonpCallback_3493749374339473947394397439473972018({
   "scripts":[
      "../../apps/JavaScript/Flickr/flickrApp.js"
   ],
   "styles":[

   ],
   "inlineScripts":[
      "F2.Events.once(F2.Constants.Events.APPLICATION_LOAD + \"f3703684-a71a-42c2-acde-cfba8fc484c1\", function (app, appAssets) { var a = new App_Class( app, appAssets, { baseUrl:'http://localhost/github/OpenF2/sdk/examples/apps/JavaScript/HelloWorld/' }); a.init(); });"
   ],
   "apps":[
      {
         "instanceId":"f3703684-a71a-42c2-acde-cfba8fc484c1",
         "html":"<div class=well><div class='f2-app-view' data-f2-view='home'><p>Hello Container. I'm 100% JavaScript talking to Flickr's <a href='http://www.flickr.com/services/api/flickr.interestingness.getList.html'>Interestingness API</a>.</p><div class='imgPlaceholder thumbnail'></div></div><div class='f2-app-view hide' data-f2-view='about'><h3>About</h3><p>This is a pretty basic app that talks to Flickr's interestingness API and shows the most recent photograph.</p><p><a href='#' class=back>&laquo; Back</a></div></div>"
      }
   ]
})