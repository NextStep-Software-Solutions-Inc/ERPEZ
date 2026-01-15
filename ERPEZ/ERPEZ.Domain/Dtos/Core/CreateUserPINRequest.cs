namespace ERPEZ.Domain.Dtos.Core;

/// <summary>
/// Request to create a new PIN for the authenticated user.
/// </summary>
public record CreateUserPINRequest
{
    /// <summary>
    /// The plain text PIN to be encrypted and stored. Must be 4-6 digits.
    /// </summary>
    public required string PIN { get; init; }

    /// <summary>
    /// Optional expiration date for the PIN. If not provided, PIN never expires.
    /// </summary>
    public DateTime? ExpiresAt { get; init; }
}
