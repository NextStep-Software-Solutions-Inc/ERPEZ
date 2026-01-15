using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Core.UserPINs.Commands.DeleteUserPIN;

/// <summary>
/// Command to delete the authenticated user's PIN.
/// </summary>
public class DeleteUserPINCommand : IRequest<ApiResponse<Unit>>
{
    /// <summary>
    /// The current PIN for verification before deletion.
    /// </summary>
    public required string CurrentPIN { get; set; }
}
