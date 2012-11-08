// --------------------------------------------------------------------------------------------------------------------
// <summary>
//   Defines the AppsController type.
// </summary>
// --------------------------------------------------------------------------------------------------------------------

namespace OpenF2.Examples.CSharp.Controllers
{
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Web;
    using System.Web.Mvc;
    using System.Web.Script.Serialization;

    using OpenF2.Examples.CSharp.Models;

    /// <summary>
    /// The apps controller.
    /// </summary>
    public class AppsController : Controller
    {
        /// <summary>
        /// The index.
        /// </summary>
        /// <returns>
        /// The <see cref="ActionResult"/>.
        /// </returns>
        public ActionResult Index()
        {
            return Content("Apps");
        }

        /// <summary>
        /// The hello world.
        /// </summary>
        /// <returns>
        /// The <see cref="ActionResult"/>.
        /// </returns>
        public ActionResult HelloWorld()
        {
            return this.Jsonp(
                "com_openf2_examples_csharp_helloworld",
                new AppManifest
                    {
                        scripts = new List<string>
                            {
                                this.ResolveUrl("~/Content/Scripts/HelloWorld/appclass.js")
                            },
                        apps =
                            new List<AppContent>
                                {
                                    new AppContent
                                        {
                                            html = this.RenderRazorViewToString("HelloWorld")
                                        }
                                }
                    });
        }

        #region Helpers

        /// <summary>
        /// The jsonp.
        /// </summary>
        /// <param name="appId">
        /// The app id.
        /// </param>
        /// <param name="data">
        /// The data.
        /// </param>
        /// <returns>
        /// The <see cref="EmptyResult"/>.
        /// </returns>
        private EmptyResult Jsonp(string appId, object data)
        {
            data = data ?? new { };

            Response.ContentType = "text/javascript";
            Response.Write(
                string.Format(
                    "F2_jsonpCallback_{0}({1})", 
                    appId, 
                    new JavaScriptSerializer().Serialize(data)));

            return new EmptyResult();
        }

        /// <summary>
        /// The render razor view to string.
        /// </summary>
        /// <param name="viewName">
        /// The view name.
        /// </param>
        /// <param name="model">
        /// The model.
        /// </param>
        /// <returns>
        /// The <see cref="string"/>.
        /// </returns>
        private string RenderRazorViewToString(string viewName, object model = null)
        {
            ViewData.Model = model;
            using (var sw = new StringWriter())
            {
                var viewResult = ViewEngines.Engines.FindPartialView(ControllerContext, viewName);
                var viewContext = new ViewContext(ControllerContext, viewResult.View, ViewData, TempData, sw);

                viewResult.View.Render(viewContext, sw);
                viewResult.ViewEngine.ReleaseView(this.ControllerContext, viewResult.View);

                return sw.GetStringBuilder().ToString();
            }
        }

        /// <summary>
        /// The resolve url.
        /// </summary>
        /// <param name="contentPath">
        /// The content path.
        /// </param>
        /// <returns>
        /// The <see cref="string"/>.
        /// </returns>
        private string ResolveUrl(string contentPath)
        {
            if (!string.IsNullOrEmpty(contentPath)
                && contentPath.StartsWith("~/"))
            {
                contentPath = VirtualPathUtility.ToAbsolute("~/") +
                    ((contentPath.Length > 2) ? contentPath.Substring(2) : string.Empty);
            }

            var url = this.HttpContext.Request.Url;
            if (url != null)
            {
                return 
                    url.GetComponents(
                        UriComponents.Host | UriComponents.Scheme, 
                        UriFormat.Unescaped) + contentPath;
            }
            return string.Empty;
        }
        #endregion Helpers
    }
}
