// --------------------------------------------------------------------------------------------------------------------
// <summary>
//   Defines the AppManifest type.
// </summary>
// --------------------------------------------------------------------------------------------------------------------

namespace OpenF2.Examples.CSharp.Models
{
    using System.Collections.Generic;

    /// <summary>
    /// The app manifest.
    /// </summary>
    public class AppManifest
    {
        /// <summary>
        /// Gets or sets the scripts.
        /// </summary>
        public List<string> scripts { get; set; }

        /// <summary>
        /// Gets or sets the styles.
        /// </summary>
        public List<string> styles { get; set; }

        /// <summary>
        /// Gets or sets the inline scripts.
        /// </summary>
        public List<string> inlineScripts { get; set; }

        /// <summary>
        /// Gets or sets the apps.
        /// </summary>
        public List<AppContent> apps { get; set; }
    }
}