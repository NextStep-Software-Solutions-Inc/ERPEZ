using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Core;

/// <summary>
/// Stores encrypted PIN for user authorization.
/// Used for authorizing financial transactions.
/// </summary>
public class UserPIN : BaseEntity
{
    /// <summary>
    /// User ID (from authentication system)
    /// </summary>
    public required Guid UserId { get; set; }

    /// <summary>
    /// Encrypted PIN hash
    /// </summary>
    public required string EncryptedPIN { get; set; }

    /// <summary>
    /// Salt used for PIN encryption
    /// </summary>
    public required string Salt { get; set; }

    /// <summary>
    /// PIN expiration date (optional, for security policies)
    /// </summary>
    public DateTime? ExpiresAt { get; set; }

    /// <summary>
    /// Number of failed validation attempts
    /// </summary>
    public int FailedAttempts { get; set; } = 0;

    /// <summary>
    /// Whether the PIN is currently locked due to too many failed attempts
    /// </summary>
    public bool IsLocked { get; set; } = false;

    /// <summary>
    /// When the PIN was locked
    /// </summary>
    public DateTime? LockedAt { get; set; }

    /// <summary>
    /// Last time the PIN was successfully used
    /// </summary>
    public DateTime? LastUsedAt { get; set; }
}
