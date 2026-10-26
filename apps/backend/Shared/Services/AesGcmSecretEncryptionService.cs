using System.Security.Cryptography;
using System.Text;
using ERPEZ.Shared.Configuration;
using ERPEZ.Shared.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace ERPEZ.Shared.Services;

/// <summary>
/// AES-256-GCM authenticated encryption service with key versioning support.
/// Slices secrets into Base64(Nonce[12] + CipherText + Tag[16]).
/// </summary>
public class AesGcmSecretEncryptionService(
    IConfiguration configuration,
    IHostEnvironment hostEnvironment,
    ILogger<AesGcmSecretEncryptionService> logger) : ISecretEncryptionService
{
    private byte[] GetKey(int keyVersion) =>
        EncryptionConfigurationValidator.GetEncryptionKey(configuration, hostEnvironment, keyVersion, logger);

    public string Encrypt(string plainText, int keyVersion = 1)
    {
        if (string.IsNullOrEmpty(plainText)) return string.Empty;

        var key = GetKey(keyVersion);
        using var aesGcm = new AesGcm(key, 16);

        var plainBytes = Encoding.UTF8.GetBytes(plainText);
        var nonce = new byte[12];
        RandomNumberGenerator.Fill(nonce);

        var cipherBytes = new byte[plainBytes.Length];
        var tag = new byte[16];

        aesGcm.Encrypt(nonce, plainBytes, cipherBytes, tag);

        // Format: Nonce[12] + CipherBytes + Tag[16]
        var combined = new byte[nonce.Length + cipherBytes.Length + tag.Length];
        Buffer.BlockCopy(nonce, 0, combined, 0, nonce.Length);
        Buffer.BlockCopy(cipherBytes, 0, combined, nonce.Length, cipherBytes.Length);
        Buffer.BlockCopy(tag, 0, combined, nonce.Length + cipherBytes.Length, tag.Length);

        return Convert.ToBase64String(combined);
    }

    public string Decrypt(string cipherText, int keyVersion = 1)
    {
        if (string.IsNullOrEmpty(cipherText)) return string.Empty;

        var key = GetKey(keyVersion);
        using var aesGcm = new AesGcm(key, 16);

        var combined = Convert.FromBase64String(cipherText);
        if (combined.Length < 28) // 12 nonce + 16 tag
        {
            throw new CryptographicException("Ciphertext payload is too short or malformed.");
        }

        var nonce = new byte[12];
        Buffer.BlockCopy(combined, 0, nonce, 0, 12);

        var cipherLength = combined.Length - 12 - 16;
        var cipherBytes = new byte[cipherLength];
        Buffer.BlockCopy(combined, 12, cipherBytes, 0, cipherLength);

        var tag = new byte[16];
        Buffer.BlockCopy(combined, 12 + cipherLength, tag, 0, 16);

        var plainBytes = new byte[cipherLength];
        aesGcm.Decrypt(nonce, cipherBytes, tag, plainBytes);

        return Encoding.UTF8.GetString(plainBytes);
    }
}
