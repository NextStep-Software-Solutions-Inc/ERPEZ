using ERPEZ.Application.Common.Services;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Interfaces;
using MediatR;

namespace ERPEZ.Application.Features.Core.UserPINs.Commands.DeleteUserPIN;

/// <summary>
/// Handler for deleting a user's PIN.
/// </summary>
public class DeleteUserPINCommandHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService,
    IPINHashingService pinHashingService) : IRequestHandler<DeleteUserPINCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteUserPINCommand request, CancellationToken cancellationToken)
    {
        // Get authenticated user
        var userIdString = currentUserService.UserId ?? throw new UnauthorizedAccessException("User is not authenticated.");
        
        if (!Guid.TryParse(userIdString, out var userId)) throw new UnauthorizedAccessException("Invalid user identifier.");
        

        // Get existing PIN
        var existingPIN = await unitOfWork.UserPINRepository.GetByUserIdAsync(userId, cancellationToken) ?? throw new NotFoundException("PIN not found.");

        // Verify current PIN before deletion
        bool isValid = pinHashingService.VerifyPIN(request.CurrentPIN, existingPIN.EncryptedPIN, existingPIN.Salt);
        if (!isValid) throw new BadRequestException("Invalid PIN. Cannot delete.");

        // Delete PIN
        unitOfWork.UserPINRepository.Remove(existingPIN);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "PIN deleted successfully.");
    }
}
