using ERPEZ.Application.Common.Services;
using ERPEZ.Domain.Entities.Core;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Interfaces;
using MediatR;

namespace ERPEZ.Application.Features.Core.UserPINs.Commands.CreateUserPIN;

/// <summary>
/// Handler for creating a new user PIN.
/// </summary>
public class CreateUserPINCommandHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService,
    IPINHashingService pinHashingService) : IRequestHandler<CreateUserPINCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateUserPINCommand request, CancellationToken cancellationToken)
    {
        // Get authenticated user
        var userIdString = currentUserService.UserId 
            ?? throw new UnauthorizedAccessException("User is not authenticated.");
        
        if (!Guid.TryParse(userIdString, out var userId))
        {
            throw new UnauthorizedAccessException("Invalid user identifier.");
        }

        // Check if user already has a PIN
        var existingPIN = await unitOfWork.UserPINRepository.GetByUserIdAsync(userId, cancellationToken);
        if (existingPIN is not null)
        {
            throw new ConflictException("User already has a PIN. Use update endpoint to change it.");
        }

        // Hash the PIN
        var (hashedPIN, salt) = pinHashingService.HashPIN(request.PIN);

        // Create new PIN entity
        var userPIN = new UserPIN
        {
            UserId = userId,
            EncryptedPIN = hashedPIN,
            Salt = salt,
            ExpiresAt = request.ExpiresAt,
            FailedAttempts = 0,
            IsLocked = false
        };

        await unitOfWork.UserPINRepository.AddAsync(userPIN, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(userPIN.Id, "PIN created successfully.");
    }
}
