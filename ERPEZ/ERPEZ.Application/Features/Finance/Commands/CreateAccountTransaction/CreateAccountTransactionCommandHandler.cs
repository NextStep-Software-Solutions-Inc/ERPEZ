using ERPEZ.Domain.Entities.Finance;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Finance.Commands.CreateAccountTransaction;

/// <summary>
/// Handler for creating a new account transaction in Draft status.
/// No balance changes occur until the transaction is authorized.
/// </summary>
public class CreateAccountTransactionCommandHandler(
    IUnitOfWork unitOfWork,
    ITransactionCodeGeneratorService codeGeneratorService)
    : IRequestHandler<CreateAccountTransactionCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateAccountTransactionCommand request, CancellationToken cancellationToken)
    {
        Guid transactionId = Guid.Empty;

        await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            // Validate source account exists
            var fromAccount = await unitOfWork.AccountRepository.GetByIdAsync(request.FromAccountId, cancellationToken)
                ?? throw new NotFoundException($"Source account with ID {request.FromAccountId} not found.");

            // Determine or create destination account
            Account toAccount;
            
            if (request.ToAccountId.HasValue)
            {
                // Use existing destination account
                toAccount = await unitOfWork.AccountRepository.GetByIdAsync(request.ToAccountId.Value, cancellationToken)
                    ?? throw new NotFoundException($"Destination account with ID {request.ToAccountId.Value} not found.");
            }
            else if (request.OfficeId.HasValue)
            {
                // Find or create account for the office using sender's fund source
                _ = await unitOfWork.OfficeRepository.GetByIdAsync(request.OfficeId.Value, cancellationToken)
                    ?? throw new NotFoundException($"Office with ID {request.OfficeId.Value} not found.");

                toAccount = await unitOfWork.AccountRepository.FindAsync(
                    a => a.OfficeId == request.OfficeId.Value && 
                         a.FundSourceId == fromAccount.FundSourceId && 
                         a.FiscalYearId == fromAccount.FiscalYearId,
                    cancellationToken) ?? throw new NotFoundException("Destination account could not be determined.");

                if (toAccount == null)
                {
                    var fundSource = fromAccount.FundSourceId.HasValue 
                        ? await unitOfWork.FundSourceRepository.GetByIdAsync(fromAccount.FundSourceId.Value, cancellationToken)
                        : null;

                    toAccount = new Account
                    {
                        OfficeId = request.OfficeId.Value,
                        FundSourceId = fromAccount.FundSourceId,
                        FiscalYearId = fromAccount.FiscalYearId,
                        Name = fundSource?.Name ?? "Auto-created Account",
                        Balance = 0m,
                        RunningBalance = 0m
                    };

                    await unitOfWork.AccountRepository.AddAsync(toAccount, cancellationToken);
                    await unitOfWork.SaveChangesAsync(cancellationToken);
                }
            }
            else
            {
                throw new BadRequestException("Either destination account or office identifier must be provided.");
            }

            // Check if transferring to different office - auto-create account if needed
            if (fromAccount.FundSourceId.HasValue && 
                toAccount.OfficeId != fromAccount.OfficeId)
            {
                var receivingOfficeAccount = await unitOfWork.AccountRepository.FindAsync(
                    a => a.OfficeId == toAccount.OfficeId && 
                         a.FundSourceId == fromAccount.FundSourceId && 
                         a.FiscalYearId == fromAccount.FiscalYearId,
                    cancellationToken);

                if (receivingOfficeAccount == null)
                {
                    var fundSource = await unitOfWork.FundSourceRepository.GetByIdAsync(fromAccount.FundSourceId.Value, cancellationToken);
                    
                    receivingOfficeAccount = new Account
                    {
                        OfficeId = toAccount.OfficeId,
                        FundSourceId = fromAccount.FundSourceId,
                        FiscalYearId = fromAccount.FiscalYearId,
                        Name = fundSource?.Name ?? "Auto-created Account",
                        Balance = 0m,
                        RunningBalance = 0m
                    };

                    await unitOfWork.AccountRepository.AddAsync(receivingOfficeAccount, cancellationToken);
                    await unitOfWork.SaveChangesAsync(cancellationToken);
                }
            }

            // Check if source account has sufficient balance (soft check - actual deduction happens on authorization)
            if (fromAccount.Balance < request.AmountTransfer)
            {
                throw new BadRequestException($"Insufficient balance in source account. Available: {fromAccount.Balance}, Required: {request.AmountTransfer}");
            }

            // Generate transaction code using service
            var generatedCode = await codeGeneratorService.GenerateTransactionCodeAsync(cancellationToken);

            // Create transaction in Draft status
            var transaction = new AccountTransaction
            {
                FromAccountId = request.FromAccountId,
                ToAccountId = toAccount.Id,
                Purpose = request.Purpose,
                AmountTransfer = request.AmountTransfer,
                Code = generatedCode,
                TransactionDate = request.TransactionDate,
                Status = StatusEnum.Draft,
                AuthorizedByUserId = null,
                AuthorizedDate = null
            };

            await unitOfWork.AccountTransactionRepository.AddAsync(transaction, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            transactionId = transaction.Id;
        }, cancellationToken);

        return ApiResponse<Guid>.Success(transactionId, "Account transaction created successfully in Draft status. Awaiting authorization.");
    }
}
