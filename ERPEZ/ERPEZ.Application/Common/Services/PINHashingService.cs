using System.Security.Cryptography;
using System.Text;

namespace ERPEZ.Application.Common.Services;

public class PINHashingService : IPINHashingService
{
    private const int saltSize = 32; // 256 bits
    private const int hashSize = 32; // 256 bits
    private const int iterations = 100000; // OWASP recommended minimum

    public (string hashedPIN, string salt) HashPIN(string plainTextPIN)
    {
        // Generate salt
        byte[] saltBytes = RandomNumberGenerator.GetBytes(saltSize);
        string salt = Convert.ToBase64String(saltBytes);

        // Hash PIN with salt
        string hashedPIN = HashPINWithSalt(plainTextPIN, saltBytes);

        return (hashedPIN, salt);
    }

    public bool VerifyPIN(string plainTextPIN, string hashedPIN, string salt)
    {
        byte[] saltBytes = Convert.FromBase64String(salt);
        string computedHash = HashPINWithSalt(plainTextPIN, saltBytes);
        return computedHash == hashedPIN;
    }

    private static string HashPINWithSalt(string plainTextPIN, byte[] salt)
    {
        byte[] hash = Rfc2898DeriveBytes.Pbkdf2(
            Encoding.UTF8.GetBytes(plainTextPIN),
            salt,
            iterations,
            HashAlgorithmName.SHA256,
            hashSize);

        return Convert.ToBase64String(hash);
    }
}
