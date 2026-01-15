using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Core.UserPINs.Commands.CreateUserPIN;

/// <summary>
/// Command to create a new PIN for the authenticated user.
/// </summary>
public class CreateUserPINCommand : IRequest<ApiResponse<Guid>>
{
    /// <summary>
    /// The plain text PIN to be encrypted and stored. Must be 4-6 digits.
    /// </summary>
    public required string PIN { get; set; }

    /// <summary>
    /// Optional expiration date for the PIN. If not provided, PIN never expires.
    /// </summary>
    public DateTime? ExpiresAt { get; set; }
}
