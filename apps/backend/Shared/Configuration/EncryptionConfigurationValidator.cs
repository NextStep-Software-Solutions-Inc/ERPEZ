using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace ERPEZ.Shared.Configuration;

/// <summary>
/// Authoritative validation and key resolution engine for secret encryption.
/// Enforces fail-closed security across non-development environments while
/// supporting local development fallback workflows.
/// </summary>
public static class EncryptionConfigurationValidator
{
    /// <summary>
    /// Resolves the raw encryption master key string adhering to strict precedence:
    /// 1. Version-specific environment variable (ENCRYPTION_MASTER_KEY_V{version})
    /// 2. Version-specific structured configuration (Encryption:Keys:V{version})
    /// 3. Legacy structured configuration (Encryption:MasterKey) [version 1 only]
    /// 4. Legacy environment variable (ENCRYPTION_MASTER_KEY) [version 1 only]
    /// </summary>
    public static string? ResolveMasterKey(IConfiguration configuration, int keyVersion = 1)
    {
        ArgumentNullException.ThrowIfNull(configuration);

        // 1. Version-specific environment / root config
        var key = configuration[$"{EncryptionOptions.versionedEnvironmentKeyPrefix}{keyVersion}"];
        if (!string.IsNullOrWhiteSpace(key)) return key;

        // 2. Version-specific structured path
        key = configuration[$"{EncryptionOptions.versionedConfigPathPrefix}{keyVersion}"];
        if (!string.IsNullOrWhiteSpace(key)) return key;

        // 3 & 4: Legacy unversioned fallbacks strictly for version 1
        if (keyVersion == 1)
        {
            key = configuration[EncryptionOptions.legacyConfigPath];
            if (!string.IsNullOrWhiteSpace(key)) return key;

            key = configuration[EncryptionOptions.legacyEnvironmentKey];
            if (!string.IsNullOrWhiteSpace(key)) return key;
        }

        return null;
    }

    /// <summary>
    /// Authoritative startup validator invoked once per application host.
    /// Ensures that non-development environments fail fast if the primary encryption master key is missing.
    /// </summary>
    public static void Validate(
        IConfiguration configuration,
        IHostEnvironment hostEnvironment,
        ILogger? logger = null)
    {
        ArgumentNullException.ThrowIfNull(configuration);
        ArgumentNullException.ThrowIfNull(hostEnvironment);

        var primaryKey = ResolveMasterKey(configuration, 1);

        if (string.IsNullOrWhiteSpace(primaryKey))
        {
            if (!hostEnvironment.IsDevelopment())
            {
                throw new InvalidOperationException(
                    $"Missing required encryption master key in non-development environment '{hostEnvironment.EnvironmentName}'. " +
                    $"Configure '{EncryptionOptions.legacyEnvironmentKey}' or '{EncryptionOptions.versionedEnvironmentKeyPrefix}1'.");
            }

            logger?.LogWarning(
                "No encryption master key configured for environment '{EnvironmentName}'. " +
                "Using development fallback key. DO NOT USE IN PRODUCTION.",
                hostEnvironment.EnvironmentName);
        }
    }

    /// <summary>
    /// Runtime key resolution used by encryption services.
    /// Returns a validated 32-byte AES key for the requested key version.
    /// In Development, version 1 may use the development fallback key if no key is configured.
    /// Missing key versions for V > 1 always throw (in any environment) to prevent silent rotation errors.
    /// Missing V1 in non-development always throws.
    /// </summary>
    public static byte[] GetEncryptionKey(
        IConfiguration configuration,
        IHostEnvironment hostEnvironment,
        int keyVersion,
        ILogger? logger = null)
    {
        ArgumentNullException.ThrowIfNull(configuration);
        ArgumentNullException.ThrowIfNull(hostEnvironment);

        if (keyVersion < 1)
        {
            throw new ArgumentOutOfRangeException(nameof(keyVersion), "Key version must be greater than or equal to 1.");
        }

        var rawKey = ResolveMasterKey(configuration, keyVersion);

        if (string.IsNullOrWhiteSpace(rawKey))
        {
            if (keyVersion == 1 && hostEnvironment.IsDevelopment())
            {
                logger?.LogWarning(
                    "Using fallback development encryption key for key version 1. DO NOT USE IN PRODUCTION.");
                return DevelopmentEncryptionDefaults.fallbackDevKey;
            }

            if (!hostEnvironment.IsDevelopment())
            {
                throw new InvalidOperationException(
                    $"Missing required encryption master key for version {keyVersion} in non-development environment '{hostEnvironment.EnvironmentName}'.");
            }

            // In Development, V > 1 missing: throw to prevent masking rotation/config bugs
            throw new InvalidOperationException(
                $"Encryption master key for version {keyVersion} is not configured.");
        }

        try
        {
            var keyBytes = Convert.FromBase64String(rawKey);
            if (keyBytes.Length == 32)
            {
                return keyBytes;
            }
        }
        catch
        {
            // Not a base64 encoded 32-byte key — fallthrough to SHA-256 hash
        }

        return SHA256.HashData(Encoding.UTF8.GetBytes(rawKey));
    }
}
