using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.AMS;

/// <summary>
/// Locally cached and validated license state consumed by the Dashboard engine.
/// Decoupled from direct Tenant Management database access.
/// </summary>
public class AmsLicenseSetting : TenantScopedEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public string LicenseKey { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string Plan { get; set; } = "Starter";

    [Sieve(CanFilter = true, CanSort = true)]
    public string AllowedDomain { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public int MaxUsers { get; set; } = 50;

    [Sieve(CanFilter = true, CanSort = true)]
    public int RemainingDays { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime? ExpiresAt { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime LastValidatedAt { get; set; } = DateTime.UtcNow;

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsValid { get; set; }

    /// <summary>
    /// Comma-separated or JSON list of enabled modules, e.g. ["ams", "sams", "pms", "pbms"]
    /// </summary>
    public string EnabledModules { get; set; } = "ams,sams";

    public string? ValidationMessage { get; set; }

    public bool IsAirGapped { get; set; }
}
