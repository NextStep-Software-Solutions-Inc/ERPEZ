using ERPEZ.Application.Common.Services;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Finance.Commands.AuthorizeAccountTransaction;

/// <summary>
/// Handler for authorizing account transactions with PIN validation.
/// Executes atomic balance transfer: debit from source, credit to destination.
/// Uses row-level locking (FOR UPDATE) to prevent race conditions.
/// </summary>
public class AuthorizeAccountTransactionCommandHandler(
    IUnitOfWork unitOfWork, 
    ICurrentUserService currentUserService,
    IPINHashingService pinHashingService)
    : IRequestHandler<AuthorizeAccountTransactionCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(AuthorizeAccountTransactionCommand request, CancellationToken cancellationToken)
    {
        // Execute in database transaction to ensure atomicity
        await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            // 1. Get the transaction
            var transaction = await unitOfWork.AccountTransactionRepository.GetByIdAsync(request.TransactionId)
                ?? throw new NotFoundException($"Transaction with ID {request.TransactionId} not found.");

            // 2. Validate transaction status
            if (transaction.Status != StatusEnum.Draft)
            {
                throw new BadRequestException($"Transaction cannot be authorized. Current status: {transaction.Status}. Only Draft transactions can be authorized.");
            }

            // 3. Get authenticated user
            var userIdString = currentUserService.UserId ?? throw new UnauthorizedAccessException("User must be authenticated to authorize transactions.");
            
            if (!Guid.TryParse(userIdString, out var userId)) throw new UnauthorizedAccessException("Invalid user identifier.");

            // 4. Validate authorization PIN
            var userPIN = await unitOfWork.UserPINRepository.GetByUserIdAsync(userId, cancellationToken) ?? throw new ForbiddenException("No PIN found for user. Please create a PIN first.");
            if (userPIN.IsLocked) throw new ForbiddenException("PIN is locked due to too many failed attempts. Please contact support.");

            // Verify the provided PIN
            bool isPINValid = pinHashingService.VerifyPIN(request.AuthorizationPIN, userPIN.EncryptedPIN, userPIN.Salt);
            
            if (!isPINValid)
            {
                // Increment failed attempts
                userPIN.FailedAttempts++;

                // Lock after 5 failed attempts
                if (userPIN.FailedAttempts >= 5)
                {
                    userPIN.IsLocked = true;
                    userPIN.LockedAt = DateTime.UtcNow;
                    await unitOfWork.SaveChangesAsync(cancellationToken);
                    throw new ForbiddenException("PIN is now locked due to too many failed attempts. Please contact support.");
                }

                await unitOfWork.SaveChangesAsync(cancellationToken);
                throw new ForbiddenException($"Invalid authorization PIN. Failed attempts: {userPIN.FailedAttempts}/5");
            }

            // Reset failed attempts and update last used time on successful validation
            userPIN.FailedAttempts = 0;
            userPIN.LastUsedAt = DateTime.UtcNow;
            unitOfWork.UserPINRepository.Update(userPIN);

            // 5. CRITICAL: Get source account with ROW-LEVEL LOCK (FOR UPDATE)
            // This prevents race conditions by ensuring no other transaction can read or modify
            // this account's balance until we're done. PostgreSQL will block concurrent transactions.
            // The query within ExecuteInTransactionAsync automatically applies locking.
            var fromAccount = await unitOfWork.AccountRepository
                .Query(a => a.Id == transaction.FromAccountId)
                .FirstOrDefaultAsync(cancellationToken)
                ?? throw new NotFoundException($"Source account with ID {transaction.FromAccountId} not found.");

            // 6. Verify sufficient funds
            if (fromAccount.Balance < transaction.AmountTransfer)
            {
                transaction.Status = StatusEnum.Failed;
                await unitOfWork.SaveChangesAsync(cancellationToken);
                throw new BadRequestException($"Insufficient balance in source account. Available: {fromAccount.Balance}, Required: {transaction.AmountTransfer}");
            }

            // 7. Get target account
            var toAccount = await unitOfWork.AccountRepository
                .Query()
                .Where(a => a.Id == transaction.ToAccountId)
                .FirstOrDefaultAsync(cancellationToken)
                ?? throw new NotFoundException($"Destination account with ID {transaction.ToAccountId} not found.");

            // 8. Execute atomic balance transfer
            fromAccount.Balance -= transaction.AmountTransfer;
            fromAccount.RunningBalance = fromAccount.Balance;

            toAccount.Balance += transaction.AmountTransfer;
            toAccount.RunningBalance = toAccount.Balance;

            // 9. Update transaction status
            transaction.Status = StatusEnum.Completed;
            transaction.AuthorizedByUserId = userId;
            transaction.AuthorizedDate = DateTime.UtcNow;

            // 10. Save all changes
            await unitOfWork.SaveChangesAsync(cancellationToken);

        }, cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Transaction authorized and completed successfully. Funds transferred.");
    }
}
