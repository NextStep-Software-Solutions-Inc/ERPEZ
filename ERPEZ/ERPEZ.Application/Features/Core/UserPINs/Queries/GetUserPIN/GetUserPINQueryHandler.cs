using ERPEZ.Domain.Dtos.Core;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Interfaces;
using MediatR;

namespace ERPEZ.Application.Features.Core.UserPINs.Queries.GetUserPIN;

/// <summary>
/// Handler for getting the authenticated user's PIN status.
/// </summary>
public class GetUserPINQueryHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService) : IRequestHandler<GetUserPINQuery, ApiResponse<UserPINResponse>>
{
    public async Task<ApiResponse<UserPINResponse>> Handle(GetUserPINQuery request, CancellationToken cancellationToken)
    {
        // Get authenticated user
        var userIdString = currentUserService.UserId ?? throw new UnauthorizedAccessException("User is not authenticated.");
        
        if (!Guid.TryParse(userIdString, out var userId)) throw new UnauthorizedAccessException("Invalid user identifier.");

        // Get PIN
        var userPIN = await unitOfWork.UserPINRepository.GetByUserIdAsync(userId, cancellationToken) ?? throw new NotFoundException("PIN not found. Please create a PIN first.");

        // Map to response (without exposing sensitive data)
        var response = new UserPINResponse
        {
            Id = userPIN.Id,
            UserId = userPIN.UserId,
            IsLocked = userPIN.IsLocked,
            FailedAttempts = userPIN.FailedAttempts,
            LockedAt = userPIN.LockedAt,
            ExpiresAt = userPIN.ExpiresAt,
            LastUsedAt = userPIN.LastUsedAt,
            CreatedAt = userPIN.CreatedAt,
            UpdatedAt = userPIN.UpdatedAt
        };

        return ApiResponse<UserPINResponse>.Success(response, "PIN status retrieved successfully.");
    }
}
