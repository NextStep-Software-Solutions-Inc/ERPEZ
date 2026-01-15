using ERPEZ.Application.Common.Services;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Interfaces;
using MediatR;

namespace ERPEZ.Application.Features.Core.UserPINs.Commands.UpdateUserPIN;

/// <summary>
/// Handler for updating an existing user PIN.
/// </summary>
public class UpdateUserPINCommandHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService,
    IPINHashingService pinHashingService) : IRequestHandler<UpdateUserPINCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateUserPINCommand request, CancellationToken cancellationToken)
    {
        // Get authenticated user
        var userIdString = currentUserService.UserId ?? throw new UnauthorizedAccessException("User is not authenticated.");
        
        if (!Guid.TryParse(userIdString, out var userId))
        {
            throw new UnauthorizedAccessException("Invalid user identifier.");
        }

        // Get existing PIN
        var existingPIN = await unitOfWork.UserPINRepository.GetByUserIdAsync(userId, cancellationToken) ?? throw new NotFoundException("PIN not found. Please create a PIN first.");

        // Check if PIN is locked
        if (existingPIN.IsLocked) throw new BadRequestException("PIN is locked due to too many failed attempts. Please contact support.");

        // Check if PIN is expired
        if (existingPIN.ExpiresAt.HasValue && existingPIN.ExpiresAt.Value < DateTime.UtcNow) throw new BadRequestException("PIN has expired. Please create a new PIN.");

        // Verify current PIN
        bool isValid = pinHashingService.VerifyPIN(request.CurrentPIN, existingPIN.EncryptedPIN, existingPIN.Salt);
        if (!isValid)
        {
            // Increment failed attempts
            existingPIN.FailedAttempts++;

            // Lock after 5 failed attempts
            if (existingPIN.FailedAttempts >= 5)
            {
                existingPIN.IsLocked = true;
                existingPIN.LockedAt = DateTime.UtcNow;
            }

            unitOfWork.UserPINRepository.Update(existingPIN);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            throw new BadRequestException($"Invalid current PIN. Failed attempts: {existingPIN.FailedAttempts}/5");
        }

        // Hash the new PIN
        var (hashedPIN, salt) = pinHashingService.HashPIN(request.NewPIN);

        // Update PIN
        existingPIN.EncryptedPIN = hashedPIN;
        existingPIN.Salt = salt;
        existingPIN.ExpiresAt = request.ExpiresAt;
        existingPIN.FailedAttempts = 0; // Reset failed attempts on successful update
        existingPIN.IsLocked = false; // Unlock if it was locked
        existingPIN.LockedAt = null;

        unitOfWork.UserPINRepository.Update(existingPIN);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "PIN updated successfully.");
    }
}
