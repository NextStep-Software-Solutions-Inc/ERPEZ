using ERPEZ.Application.Common.Dtos.AMS;

namespace ERPEZ.Application.Interfaces.Services;

/// <summary>
/// Service contract for consuming cryptographic licenses in the Dashboard engine.
/// Decouples module gating and user capacity limits from direct Tenant Management database calls.
/// </summary>
public interface ILicenseConsumptionService
{
    /// <summary>
    /// Gets the current active license status, plan, capacity metrics, and unlocked modules.
    /// </summary>
    Task<LicenseStatusDto> GetCurrentLicenseAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Validates and activates a new license key (online via Tenant Management or offline via signed certificate).
    /// </summary>
    Task<LicenseActivationResultDto> ActivateLicenseAsync(string licenseKey, string? currentDomain = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks whether an ERP module ('ams', 'sams', 'pms', 'pbms') is unlocked under the current license.
    /// </summary>
    Task<bool> IsModuleEnabledAsync(string moduleCode, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks whether the active user count has reached or exceeded the license user limit.
    /// </summary>
    Task<bool> IsUserLimitExceededAsync(CancellationToken cancellationToken = default);
}
