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
        // Validate source account exists
        var fromAccount = await unitOfWork.AccountRepository.GetByIdAsync(request.FromAccountId, cancellationToken)
            ?? throw new NotFoundException($"Source account with ID {request.FromAccountId} not found.");

        // Validate destination account exists
        _ = await unitOfWork.AccountRepository.GetByIdAsync(request.ToAccountId, cancellationToken)
            ?? throw new NotFoundException($"Destination account with ID {request.ToAccountId} not found.");

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
            ToAccountId = request.ToAccountId,
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

        return ApiResponse<Guid>.Success(transaction.Id, "Account transaction created successfully in Draft status. Awaiting authorization.");
    }
}
