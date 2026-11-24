namespace ERPEZ.Shared.Configuration;

/// <summary>
/// Configuration constants and options for secret encryption across ERPEZ hosts.
/// </summary>
public static class EncryptionOptions
{
    public const string sectionName = "Encryption";
    public const string legacyEnvironmentKey = "ENCRYPTION_MASTER_KEY";
    public const string versionedEnvironmentKeyPrefix = "ENCRYPTION_MASTER_KEY_V";
    public const string versionedConfigPathPrefix = "Encryption:Keys:V";
    public const string legacyConfigPath = "Encryption:MasterKey";
}
