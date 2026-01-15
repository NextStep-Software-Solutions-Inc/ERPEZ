namespace ERPEZ.Domain.Dtos.Core;

/// <summary>
/// Request to update the authenticated user's PIN.
/// </summary>
public record UpdateUserPINRequest
{
    /// <summary>
    /// The current PIN for verification.
    /// </summary>
    public required string CurrentPIN { get; init; }

    /// <summary>
    /// The new PIN to set. Must be 4-6 digits.
    /// </summary>
    public required string NewPIN { get; init; }

    /// <summary>
    /// Optional expiration date for the new PIN.
    /// </summary>
    public DateTime? ExpiresAt { get; init; }
}
