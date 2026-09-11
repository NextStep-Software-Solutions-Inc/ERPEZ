namespace ERPEZ.Shared.Configuration;

/// <summary>
/// Configuration options governing tenant database connection routing and development fallbacks.
/// </summary>
public class TenantRoutingOptions
{
    public const string sectionName = "TenantRouting";

    /// <summary>
    /// When true, allows fallback to DefaultConnection only within Development environment
    /// for startup data seeding and local tooling. Strictly prohibited in Production.
    /// </summary>
    public bool AllowDevelopmentFallback { get; set; } = false;
}
