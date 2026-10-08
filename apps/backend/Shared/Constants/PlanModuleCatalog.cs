namespace ERPEZ.Shared.Constants;

/// <summary>
/// Authoritative single source of truth for commercial ERP-EZ plan to module entitlement mappings.
/// Decouples commercial packaging definitions from service-specific implementations.
/// </summary>
public static class PlanModuleCatalog
{
    public const string moduleAms = "ams";
    public const string modulePbms = "pbms";
    public const string modulePms = "pms";
    public const string moduleSams = "sams";

    /// <summary>
    /// Starter Tier: Core identity, organization hierarchy, and planning & budgeting.
    /// </summary>
    public static readonly IReadOnlyList<string> starterModules = [moduleAms, modulePbms];

    /// <summary>
    /// Professional (Business) Tier: Starter plus full procurement lifecycle (PR, RFQ, PO).
    /// </summary>
    public static readonly IReadOnlyList<string> professionalModules = [moduleAms, modulePbms, modulePms];

    /// <summary>
    /// Enterprise Tier: Full operational ERP suite. SAMS will be added upon official release.
    /// </summary>
    public static readonly IReadOnlyList<string> enterpriseModules = [moduleAms, modulePbms, modulePms];

    /// <summary>
    /// 30-Day Free Trial: Evaluates the full operational platform (AMS + PBMS + PMS).
    /// </summary>
    public static readonly IReadOnlyList<string> trialModules = [moduleAms, modulePbms, modulePms];

    /// <summary>
    /// Resolves the normalized list of active module codes for any given plan code or name.
    /// </summary>
    public static IReadOnlyList<string> GetModulesForPlan(string? plan)
    {
        if (string.IsNullOrWhiteSpace(plan))
        {
            return starterModules;
        }

        var normalized = plan.Trim().ToUpperInvariant();

        return normalized switch
        {
            "PRO" or "PROFESSIONAL" or "BUSINESS" => professionalModules,
            "ENTERPRISE" or "ONPREM" or "ONPREMISE" => enterpriseModules,
            "TRIAL" => trialModules,
            _ => starterModules
        };
    }
}
