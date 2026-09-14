using System.Security.Cryptography;
using System.Text;
using ERPEZ.Shared.Interfaces;
using Microsoft.Extensions.Configuration;

namespace ERPEZ.Shared.Services;

/// <summary>
/// AES-256-GCM authenticated encryption service with key versioning support.
/// Slices secrets into Base64(Nonce[12] + CipherText + Tag[16]).
/// </summary>
public class AesGcmSecretEncryptionService(IConfiguration configuration) : ISecretEncryptionService
{
    private static readonly byte[] fallbackDevKey = SHA256.HashData(Encoding.UTF8.GetBytes("ERPEZ_DEFAULT_SECRET_KEY_DEV_ONLY_DO_NOT_USE_IN_PROD"));

    private byte[] GetKey(int keyVersion)
    {
        var rawKey = configuration[$"ENCRYPTION_MASTER_KEY_V{keyVersion}"]
            ?? configuration[$"Encryption:Keys:V{keyVersion}"]
            ?? configuration["ENCRYPTION_MASTER_KEY"];

        if (string.IsNullOrWhiteSpace(rawKey))
        {
            return fallbackDevKey;
        }

        try
        {
            var keyBytes = Convert.FromBase64String(rawKey);
            if (keyBytes.Length == 32) return keyBytes;
        }
        catch
        {
            // Not base64 formatted
        }

        return SHA256.HashData(Encoding.UTF8.GetBytes(rawKey));
    }

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
