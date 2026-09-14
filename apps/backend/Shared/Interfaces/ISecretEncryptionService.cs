namespace ERPEZ.Shared.Interfaces;

/// <summary>
/// Authenticated symmetric encryption service for sensitive secrets (connection strings, credentials).
/// </summary>
public interface ISecretEncryptionService
{
    string Encrypt(string plainText, int keyVersion = 1);
    string Decrypt(string cipherText, int keyVersion = 1);
}
