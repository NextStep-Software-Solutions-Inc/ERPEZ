using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Enums;

namespace ERPEZ.TenantManagement.Application.Common.Interfaces;

public record GenerateLicenseKeyModel(
    string Prefix,
    string BoundEmail,
    Plan Plan,
    DateTime ExpiresAt,
    string AllowedDomain,
    int MaxTenants = 1,
    int MaxUsers = 50,
    bool IsAirGapped = true,
    Guid? TenantId = null,
    Guid? TenantSubscriptionId = null,
    string? Notes = null
);

public record LicenseValidationResult(
    bool IsValid,
    string? ErrorMessage,
    LicenseKey? LicenseKey,
    bool IsDomainMatched,
    bool IsExpired,
    int RemainingDays
);

public interface ILicenseService
{
    string GenerateKeyString(string prefix, string boundEmail, DateTime expiresAt, Plan plan);
    string ComputeSignature(string key, string boundEmail, string allowedDomain, DateTime expiresAt);
    bool VerifySignature(string key, string boundEmail, string allowedDomain, DateTime expiresAt, string signature);
    LicenseValidationResult ValidateLicense(LicenseKey license, string currentDomain);
}
