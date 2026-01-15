namespace ERPEZ.Domain.Dtos.Core;

/// <summary>
/// Response containing user PIN status information (without exposing sensitive data).
/// </summary>
public record UserPINResponse
{
    /// <summary>
    /// The unique identifier of the PIN record.
    /// </summary>
    public required Guid Id { get; init; }

    /// <summary>
    /// The user ID who owns this PIN.
    /// </summary>
    public required Guid UserId { get; init; }

    /// <summary>
    /// Whether the PIN is currently locked due to failed attempts.
    /// </summary>
    public required bool IsLocked { get; init; }

    /// <summary>
    /// The number of failed PIN attempts.
    /// </summary>
    public required int FailedAttempts { get; init; }

    /// <summary>
    /// When the PIN was locked (if IsLocked is true).
    /// </summary>
    public DateTime? LockedAt { get; init; }

    /// <summary>
    /// When the PIN expires (if set).
    /// </summary>
    public DateTime? ExpiresAt { get; init; }

    /// <summary>
    /// When the PIN was last successfully used.
    /// </summary>
    public DateTime? LastUsedAt { get; init; }

    /// <summary>
    /// When the PIN was created.
    /// </summary>
    public required DateTime CreatedAt { get; init; }

    /// <summary>
    /// When the PIN was last updated.
    /// </summary>
    public DateTime? UpdatedAt { get; init; }
}
