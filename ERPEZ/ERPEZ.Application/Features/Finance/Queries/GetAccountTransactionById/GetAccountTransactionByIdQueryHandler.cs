using ERPEZ.Domain.Dtos.Finance;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Finance.Queries.GetAccountTransactionById;

public class GetAccountTransactionByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetAccountTransactionByIdQuery, ApiResponse<AccountTransactionResponse>>
{
    public async Task<ApiResponse<AccountTransactionResponse>> Handle(GetAccountTransactionByIdQuery request, CancellationToken cancellationToken)
    {
        var transaction = await unitOfWork.AccountTransactionRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException($"Account transaction with ID {request.Id} not found.");

        var response = new AccountTransactionResponse
        {
            Id = transaction.Id,
            FromAccountId = transaction.FromAccountId,
            FromAccount = new AccountSummaryResponse
            {
                Id = transaction.FromAccount.Id,
                OfficeId = transaction.FromAccount.OfficeId,
                OfficeName = transaction.FromAccount.Office.Name,
                FundSourceId = transaction.FromAccount.FundSourceId,
                FundSourceName = transaction.FromAccount.FundSource?.Name,
                FiscalYearId = transaction.FromAccount.FiscalYearId,
                FiscalYear = transaction.FromAccount.FiscalYear.Year,
                Name = transaction.FromAccount.Name,
                Balance = transaction.FromAccount.Balance
            },
            ToAccountId = transaction.ToAccountId,
            ToAccount = new AccountSummaryResponse
            {
                Id = transaction.ToAccount.Id,
                OfficeId = transaction.ToAccount.OfficeId,
                OfficeName = transaction.ToAccount.Office.Name,
                FundSourceId = transaction.ToAccount.FundSourceId,
                FundSourceName = transaction.ToAccount.FundSource?.Name,
                FiscalYearId = transaction.ToAccount.FiscalYearId,
                FiscalYear = transaction.ToAccount.FiscalYear.Year,
                Name = transaction.ToAccount.Name,
                Balance = transaction.ToAccount.Balance
            },
            Purpose = transaction.Purpose,
            AmountTransfer = transaction.AmountTransfer,
            Code = transaction.Code,
            TransactionDate = transaction.TransactionDate,
            Status = transaction.Status.ToString(),
            AuthorizedByUserId = transaction.AuthorizedByUserId,
            AuthorizedDate = transaction.AuthorizedDate,
            CreatedAt = transaction.CreatedAt,
            CreatedBy = transaction.CreatedBy,
            UpdatedAt = transaction.UpdatedAt,
            UpdatedBy = transaction.UpdatedBy
        };

        return ApiResponse<AccountTransactionResponse>.Success(response);
    }
}
