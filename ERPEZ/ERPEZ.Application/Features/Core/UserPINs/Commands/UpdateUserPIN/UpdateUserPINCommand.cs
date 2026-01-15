using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Core.UserPINs.Commands.UpdateUserPIN;

/// <summary>
/// Command to update the authenticated user's existing PIN.
/// </summary>
public class UpdateUserPINCommand : IRequest<ApiResponse<Unit>>
{
    /// <summary>
    /// The current PIN for verification.
    /// </summary>
    public required string CurrentPIN { get; set; }

    /// <summary>
    /// The new PIN to set. Must be 4-6 digits.
    /// </summary>
    public required string NewPIN { get; set; }

    /// <summary>
    /// Optional expiration date for the new PIN.
    /// </summary>
    public DateTime? ExpiresAt { get; set; }
}
