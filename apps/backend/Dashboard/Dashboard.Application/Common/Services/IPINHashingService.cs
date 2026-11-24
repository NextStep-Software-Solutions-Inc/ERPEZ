namespace ERPEZ.Application.Common.Services;

/// <summary>
/// Service for hashing and verifying PINs using PBKDF2.
/// </summary>
public interface IPINHashingService
{
    /// <summary>
    /// Hashes a plain text PIN with a generated salt.
    /// </summary>
    /// <param name="plainTextPIN">The plain text PIN to hash.</param>
    /// <returns>A tuple containing the hashed PIN and the salt used.</returns>
    (string hashedPIN, string salt) HashPIN(string plainTextPIN);

    /// <summary>
    /// Verifies a plain text PIN against a hashed PIN and salt.
    /// </summary>
    /// <param name="plainTextPIN">The plain text PIN to verify.</param>
    /// <param name="hashedPIN">The hashed PIN to compare against.</param>
    /// <param name="salt">The salt used when hashing.</param>
    /// <returns>True if the PIN matches, false otherwise.</returns>
    bool VerifyPIN(string plainTextPIN, string hashedPIN, string salt);
}
