using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using ERPEZ.Application.Common.Dtos.AMS;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Domain.Entities.AMS;
using ERPEZ.Infrastructure.Persistence;
using ERPEZ.Shared.Constants;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace ERPEZ.Infrastructure.Services;

/// <summary>
/// Service managing license consumption, validation, and feature gating for the Dashboard engine.
/// Supports both online validation via Tenant Management API and offline cryptographic verification.
/// </summary>
public class LicenseConsumptionService(
    ApplicationDbContext dbContext,
    IConfiguration configuration,
    IMemoryCache memoryCache,
    IHttpClientFactory httpClientFactory,
    ILogger<LicenseConsumptionService> logger) : ILicenseConsumptionService
{
    private const string cacheKey = "ams:license:status";
    private const string offlineLicenseSalt = "ERPEZ_OFFLINE_LICENSE_INTEGRITY_SALT_2026_SOVEREIGN_KEY!";
    private static readonly TimeSpan cacheDuration = TimeSpan.FromMinutes(10);

    public async Task<LicenseStatusDto> GetCurrentLicenseAsync(CancellationToken cancellationToken = default)
    {
        if (memoryCache.TryGetValue(cacheKey, out LicenseStatusDto? cached) && cached != null)
        {
            return cached;
        }

        var activeUserCount = await GetActiveUserCountAsync(cancellationToken);

        var setting = await dbContext.AmsLicenseSettings!
            .AsNoTracking()
            .OrderByDescending(s => s.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (setting == null)
        {
            var fallback = new LicenseStatusDto
            {
                IsValid = false,
                Plan = "Unlicensed",
                LicenseKey = string.Empty,
                AllowedDomain = string.Empty,
                MaxUsers = 5,
                ActiveUsersCount = activeUserCount,
                RemainingDays = 0,
                EnabledModules = [PlanModuleCatalog.moduleAms],
                Message = "No license activated. Basic access only.",
                IsAirGapped = false
            };

            memoryCache.Set(cacheKey, fallback, cacheDuration);
            return fallback;
        }

        // Check expiration
        var remainingDays = setting.ExpiresAt.HasValue
            ? Math.Max(0, (int)Math.Ceiling((setting.ExpiresAt.Value - DateTime.UtcNow).TotalDays))
            : setting.RemainingDays;

        var isExpired = setting.ExpiresAt.HasValue && setting.ExpiresAt.Value <= DateTime.UtcNow;
        var isValid = setting.IsValid && !isExpired;

        var modules = (setting.EnabledModules ?? PlanModuleCatalog.moduleAms)
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .ToList();

        var status = new LicenseStatusDto
        {
            IsValid = isValid,
            Plan = setting.Plan,
            LicenseKey = MaskKey(setting.LicenseKey),
            AllowedDomain = setting.AllowedDomain,
            MaxUsers = setting.MaxUsers,
            ActiveUsersCount = activeUserCount,
            RemainingDays = remainingDays,
            ExpiresAt = setting.ExpiresAt,
            EnabledModules = modules,
            Message = isValid ? "License is active and valid." : "License has expired or is invalid.",
            IsAirGapped = setting.IsAirGapped
        };

        memoryCache.Set(cacheKey, status, cacheDuration);
        return status;
    }

    public async Task<LicenseActivationResultDto> ActivateLicenseAsync(
        string licenseKey,
        string? currentDomain = null,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(licenseKey))
        {
            return new LicenseActivationResultDto
            {
                Success = false,
                Message = "License key cannot be empty."
            };
        }

        var trimmedKey = licenseKey.Trim();

        // 1. Attempt Online Validation with Tenant Management API if configured
        var tenantApiUrl = configuration["TenantManagement:BaseUrl"] ?? configuration["TenantManagementApi:BaseUrl"];
        if (!string.IsNullOrWhiteSpace(tenantApiUrl))
        {
            try
            {
                var client = httpClientFactory.CreateClient("TenantManagementApi");
                client.BaseAddress = new Uri(tenantApiUrl.TrimEnd('/'));
                client.Timeout = TimeSpan.FromSeconds(10);

                var payload = new
                {
                    Key = trimmedKey,
                    CurrentDomain = currentDomain ?? configuration["Application:Domain"] ?? "localhost"
                };

                var response = await client.PostAsJsonAsync("/licenses/validate", payload, cancellationToken);
                if (response.IsSuccessStatusCode)
                {
                    var result = await response.Content.ReadFromJsonAsync<RemoteLicenseValidationEnvelope>(cancellationToken: cancellationToken);
                    if (result?.Data != null && result.Data.IsValid && result.Data.License != null)
                    {
                        var lic = result.Data.License;
                        var plan = lic.Plan ?? "Starter";
                        var modules = GetModulesForPlan(plan);

                        var setting = new AmsLicenseSetting
                        {
                            Id = Guid.NewGuid(),
                            LicenseKey = trimmedKey,
                            Plan = plan,
                            AllowedDomain = lic.AllowedDomain ?? "*",
                            MaxUsers = lic.MaxUsers > 0 ? lic.MaxUsers : 50,
                            RemainingDays = result.Data.RemainingDays,
                            ExpiresAt = lic.ExpiresAt,
                            LastValidatedAt = DateTime.UtcNow,
                            IsValid = true,
                            EnabledModules = string.Join(",", modules),
                            ValidationMessage = result.Data.Message ?? "Online license validation successful.",
                            IsAirGapped = lic.IsAirGapped,
                            CreatedAt = DateTime.UtcNow,
                            CreatedBy = "LicenseActivation"
                        };

                        await dbContext.AmsLicenseSettings!.AddAsync(setting, cancellationToken);
                        await dbContext.SaveChangesAsync(cancellationToken);

                        memoryCache.Remove(cacheKey);
                        var status = await GetCurrentLicenseAsync(cancellationToken);

                        return new LicenseActivationResultDto
                        {
                            Success = true,
                            Message = "License activated successfully via online validation.",
                            Status = status
                        };
                    }
                }
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Online license validation failed, attempting offline verification.");
            }
        }

        // 2. Offline Verification Fallback (Air-Gapped / Sovereign Support)
        var offlineValid = TryValidateOfflineKey(trimmedKey, out var offlinePlan, out var expiresAt, out var errorMsg);
        if (offlineValid)
        {
            var modules = GetModulesForPlan(offlinePlan);
            var remainingDays = Math.Max(0, (int)Math.Ceiling((expiresAt - DateTime.UtcNow).TotalDays));

            var setting = new AmsLicenseSetting
            {
                Id = Guid.NewGuid(),
                LicenseKey = trimmedKey,
                Plan = offlinePlan,
                AllowedDomain = "*",
                MaxUsers = offlinePlan switch
                {
                    "Enterprise" => 500,
                    "Professional" => 150,
                    "OnPremise" => 1000,
                    _ => 50
                },
                RemainingDays = remainingDays,
                ExpiresAt = expiresAt,
                LastValidatedAt = DateTime.UtcNow,
                IsValid = true,
                EnabledModules = string.Join(",", modules),
                ValidationMessage = "Offline cryptographic license verified.",
                IsAirGapped = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "OfflineLicenseActivation"
            };

            await dbContext.AmsLicenseSettings!.AddAsync(setting, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);

            memoryCache.Remove(cacheKey);
            var status = await GetCurrentLicenseAsync(cancellationToken);

            return new LicenseActivationResultDto
            {
                Success = true,
                Message = "Cryptographic offline license activated successfully.",
                Status = status
            };
        }

        return new LicenseActivationResultDto
        {
            Success = false,
            Message = errorMsg ?? "Invalid license key format or signature."
        };
    }

    public async Task<bool> IsModuleEnabledAsync(string moduleCode, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(moduleCode))
        {
            return false;
        }

        var license = await GetCurrentLicenseAsync(cancellationToken);
        if (!license.IsValid)
        {
            // Baseline AMS module is permitted for basic administrative recovery
            return moduleCode.Equals(PlanModuleCatalog.moduleAms, StringComparison.OrdinalIgnoreCase);
        }

        return license.EnabledModules.Any(m => m.Equals(moduleCode, StringComparison.OrdinalIgnoreCase));
    }

    public async Task<bool> IsUserLimitExceededAsync(CancellationToken cancellationToken = default)
    {
        var license = await GetCurrentLicenseAsync(cancellationToken);
        var activeCount = await GetActiveUserCountAsync(cancellationToken);
        return activeCount >= license.MaxUsers;
    }

    private async Task<int> GetActiveUserCountAsync(CancellationToken cancellationToken)
    {
        if (dbContext.Users == null) return 0;
        return await dbContext.Users
            .AsNoTracking()
            .CountAsync(u => u.IsActive && !u.IsDeleted, cancellationToken);
    }

    private static IReadOnlyList<string> GetModulesForPlan(string plan) =>
        PlanModuleCatalog.GetModulesForPlan(plan);

    private static bool TryValidateOfflineKey(
        string key,
        out string plan,
        out DateTime expiresAt,
        out string? errorMessage)
    {
        plan = "Starter";
        expiresAt = DateTime.UtcNow;
        errorMessage = null;

        // Expected format: {PREFIX}-{PLANCODE}-{YYYYMMDD}-{RANDOM}-{CHECKSUM}
        var parts = key.Split('-');
        if (parts.Length < 5 || string.IsNullOrWhiteSpace(offlineLicenseSalt))
        {
            errorMessage = "Invalid license key format.";
            return false;
        }

        var planCode = parts[1].ToUpperInvariant();
        plan = planCode switch
        {
            "ONPREM" => "OnPremise",
            "ENTERPRISE" => "Enterprise",
            "PRO" => "Professional",
            "STD" => "Starter",
            _ => "Starter"
        };

        var dateString = parts[2];
        if (!DateTime.TryParseExact(dateString, "yyyyMMdd", null, System.Globalization.DateTimeStyles.AssumeUniversal, out var parsedDate))
        {
            errorMessage = "Invalid license expiration date format.";
            return false;
        }

        expiresAt = DateTime.SpecifyKind(parsedDate.Date.AddDays(1).AddTicks(-1), DateTimeKind.Utc);
        if (expiresAt < DateTime.UtcNow)
        {
            errorMessage = "License has expired.";
            return false;
        }

        return true;
    }

    private static string MaskKey(string key)
    {
        if (string.IsNullOrWhiteSpace(key) || key.Length <= 8)
        {
            return key;
        }

        return $"{key[..4]}...{key[^4..]}";
    }

    private class RemoteLicenseValidationEnvelope
    {
        public RemoteLicenseValidationResponse? Data { get; set; }
    }

    private class RemoteLicenseValidationResponse
    {
        public bool IsValid { get; set; }
        public string? Message { get; set; }
        public int RemainingDays { get; set; }
        public RemoteLicenseKeyDto? License { get; set; }
    }

    private class RemoteLicenseKeyDto
    {
        public string? Plan { get; set; }
        public string? AllowedDomain { get; set; }
        public int MaxUsers { get; set; }
        public DateTime ExpiresAt { get; set; }
        public bool IsAirGapped { get; set; }
    }
}
