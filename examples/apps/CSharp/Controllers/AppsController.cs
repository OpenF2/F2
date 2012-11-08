using System;
using System.Collections.Generic;
using System.IO;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;
using OpenF2.Examples.CSharp.Models;

namespace OpenF2.Examples.CSharp.Controllers
{
	public class AppsController : Controller
	{
		public ActionResult Index()
		{
			return Content("Apps");
		}

		public ActionResult HelloWorld()
		{
			return Jsonp(
				"com_openf2_examples_csharp_helloworld",
				new AppManifest
				{
					scripts = new List<string>
					{
						ResolveUrl("~/Content/Scripts/HelloWorld/appclass.js")
					},
					apps = new List<AppContent>
					{
						new AppContent
						{
							html = RenderRazorViewToString("HelloWorld")
						}
					}
				}
			);
		}

		#region Helpers
		private EmptyResult Jsonp(string appId, object data)
		{
			data = data ?? new { };

			Response.ContentType = "text/javascript";
			Response.Write(string.Format("F2_jsonpCallback_{0}({1})",
				appId,
				new JavaScriptSerializer().Serialize(data)
			));

			return new EmptyResult();
		}

		private string RenderRazorViewToString(string viewName, object model = null)
		{
			ViewData.Model = model;
			using (var sw = new StringWriter())
			{
				var viewResult = ViewEngines.Engines.FindPartialView(ControllerContext, viewName);
				var viewContext = new ViewContext(ControllerContext, viewResult.View, ViewData, TempData, sw);

				viewResult.View.Render(viewContext, sw);
				viewResult.ViewEngine.ReleaseView(ControllerContext, viewResult.View);

				return sw.GetStringBuilder().ToString();
			}
		}

		private string ResolveUrl(string contentPath)
		{
			if (!string.IsNullOrEmpty(contentPath)
				&& contentPath.StartsWith("~/"))
			{
				contentPath = VirtualPathUtility.ToAbsolute("~/") +
					((contentPath.Length > 2) ? contentPath.Substring(2) : "");
			}

			return 
				HttpContext.Request.Url.GetComponents(
					UriComponents.Host | UriComponents.Scheme
					, UriFormat.Unescaped
				) + contentPath;
		}
		#endregion Helpers
	}
}
