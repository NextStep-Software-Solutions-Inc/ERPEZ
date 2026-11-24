using System.Security.Cryptography;
using System.Text;
using ERPEZ.TenantManagement.Application.Common.Interfaces;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Enums;

namespace ERPEZ.TenantManagement.Infrastructure.Services;

public class LicenseService : ILicenseService
{
    private const string licenseSecretSalt = "ERPEZ_OFFLINE_LICENSE_INTEGRITY_SALT_2026_SOVEREIGN_KEY!";

    public string GenerateKeyString(string prefix, string boundEmail, DateTime expiresAt, Plan plan)
    {
        var cleanPrefix = string.IsNullOrWhiteSpace(prefix)
            ? "EPZ"
            : string.Concat(prefix.Where(char.IsLetterOrDigit)).ToUpperInvariant();

        if (cleanPrefix.Length > 12)
        {
            cleanPrefix = cleanPrefix[..12];
        }

        var planCode = plan switch
        {
            Plan.OnPremise => "ONPREM",
            Plan.Enterprise => "ENTERPRISE",
            Plan.Professional => "PRO",
            Plan.Starter => "STD",
            _ => "STD"
        };

        var expiryCode = expiresAt.ToString("yyyyMMdd");

        var randomBytes = new byte[4];
        RandomNumberGenerator.Fill(randomBytes);
        var randomToken = Convert.ToHexString(randomBytes);

        var payload = $"{cleanPrefix}-{planCode}-{expiryCode}-{randomToken}";

        using var sha = SHA256.Create();
        var hashBytes = sha.ComputeHash(Encoding.UTF8.GetBytes(payload + boundEmail.ToLowerInvariant() + licenseSecretSalt));
        var checksum = Convert.ToHexString(hashBytes)[..4];

        return $"{payload}-{checksum}";
    }

    public string ComputeSignature(string key, string boundEmail, string allowedDomain, DateTime expiresAt)
    {
        var rawData = $"{key.Trim()}|{boundEmail.Trim().ToLowerInvariant()}|{allowedDomain.Trim().ToLowerInvariant()}|{expiresAt:yyyy-MM-dd}|{licenseSecretSalt}";
        using var sha = SHA256.Create();
        var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(rawData));
        return Convert.ToHexString(bytes);
    }

    public bool VerifySignature(string key, string boundEmail, string allowedDomain, DateTime expiresAt, string signature)
    {
        var expected = ComputeSignature(key, boundEmail, allowedDomain, expiresAt);
        return string.Equals(expected, signature, StringComparison.OrdinalIgnoreCase);
    }

    public LicenseValidationResult ValidateLicense(LicenseKey license, string currentDomain)
    {
        if (license == null)
        {
            return new LicenseValidationResult(false, "No license provided.", null, false, true, 0);
        }

        if (license.Status != LicenseStatus.Active)
        {
            return new LicenseValidationResult(false, $"License is {license.Status}.", license, false, false, 0);
        }

        // Expiration check
        var remainingTime = license.ExpiresAt - DateTime.UtcNow;
        var isExpired = remainingTime.TotalSeconds <= 0;
        var remainingDays = Math.Max(0, (int)Math.Ceiling(remainingTime.TotalDays));

        if (isExpired)
        {
            return new LicenseValidationResult(false, "License has expired. Please renew your subscription key.", license, false, true, 0);
        }

        // Signature integrity check
        if (!string.IsNullOrWhiteSpace(license.Signature))
        {
            var isValidSignature = VerifySignature(license.Key, license.BoundEmail, license.AllowedDomain, license.ExpiresAt, license.Signature);
            if (!isValidSignature)
            {
                return new LicenseValidationResult(false, "Tamper detected: License signature verification failed.", license, false, false, remainingDays);
            }
        }

        // Domain constraints check
        var isDomainMatched = CheckDomainMatch(license.AllowedDomain, currentDomain);
        if (!isDomainMatched)
        {
            return new LicenseValidationResult(
                false,
                $"Domain constraint violation: This license is restricted to '{license.AllowedDomain}', but accessed via '{currentDomain}'.",
                license,
                false,
                false,
                remainingDays);
        }

        return new LicenseValidationResult(true, null, license, true, false, remainingDays);
    }

    private static bool CheckDomainMatch(string allowedDomain, string currentDomain)
    {
        if (string.IsNullOrWhiteSpace(allowedDomain) || allowedDomain == "*")
        {
            return true;
        }

        var normalizedCurrent = NormalizeDomain(currentDomain);
        var normalizedAllowed = NormalizeDomain(allowedDomain);

        if (string.IsNullOrWhiteSpace(normalizedCurrent))
        {
            return true;
        }

        // Allow localhost and loopback in dev
        if (normalizedCurrent is "localhost" or "127.0.0.1" or "::1")
        {
            return true;
        }

        if (string.Equals(normalizedCurrent, normalizedAllowed, StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        if (normalizedAllowed.StartsWith("*.") && normalizedCurrent.EndsWith(normalizedAllowed[1..], StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        return false;
    }

    private static string NormalizeDomain(string domain)
    {
        if (string.IsNullOrWhiteSpace(domain))
            return string.Empty;

        var d = domain.Trim().ToLowerInvariant();
        if (d.StartsWith("http://")) d = d[7..];
        if (d.StartsWith("https://")) d = d[8..];
        var colonIdx = d.IndexOf(':');
        if (colonIdx >= 0) d = d[..colonIdx];
        var slashIdx = d.IndexOf('/');
        if (slashIdx >= 0) d = d[..slashIdx];
        return d;
    }
}
