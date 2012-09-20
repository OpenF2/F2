using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace OpenF2.Examples.CSharp.Models
{
	public class AppManifest
	{
		public List<string> scripts { get; set; }
		public List<string> styles { get; set; }
		public List<string> inlineScripts { get; set; }
		public List<AppContent> apps { get; set; }
	}
}