/* 
 * Callback function name must include "appId" as configured by Container 
 * 
 * Couple things 
 *    - InstanceID is hard-coded twice in this file. Not great.
 *    - Would be great if InlineScripts were legible
 *    - Same with Apps.HTML
 *
 */
containerToApp_3493749374339473947394397439473972018({
   "Scripts":[
      "http://localhost/github/OpenF2/sdk/examples/apps/JavaScript/Flickr/app.js"
   ],
   "Styles":[

   ],
   "InlineScripts":[
      "F2.Events.once(F2.Constants.Events.APPLICATION_LOAD + \"f3703684-a71a-42c2-acde-cfba8fc484c1\", function (app, appAssets) { var a = new App_Class( app, appAssets, { baseUrl:'http://localhost/github/OpenF2/sdk/examples/apps/JavaScript/HelloWorld/' }); a.init(); });"
   ],
   "Apps":[
      {
         "InstanceId":"f3703684-a71a-42c2-acde-cfba8fc484c1",
         "Html":"<div class=well><p>Hello Container. I'm 100% JavaScript talking to Flickr's <a href='http://www.flickr.com/services/api/flickr.interestingness.getList.html'>Interestingness API</a>.</p><div id='imgPlaceholder' class='thumbnail'></div></div>"
      }
   ]
})