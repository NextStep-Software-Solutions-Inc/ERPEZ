using System.Security.Cryptography;
using System.Text;

namespace ERPEZ.Shared.Configuration;

/// <summary>
/// Hardcoded encryption defaults strictly for local development environments.
/// Under no circumstances should this key be used or activated in Staging or Production.
/// </summary>
internal static class DevelopmentEncryptionDefaults
{
    internal static readonly byte[] fallbackDevKey =
        SHA256.HashData(Encoding.UTF8.GetBytes("ERPEZ_DEFAULT_SECRET_KEY_DEV_ONLY_DO_NOT_USE_IN_PROD"));
}
