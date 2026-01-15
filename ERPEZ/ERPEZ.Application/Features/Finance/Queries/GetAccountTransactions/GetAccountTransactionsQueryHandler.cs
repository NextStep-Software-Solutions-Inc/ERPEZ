using ERPEZ.Domain.Dtos.Finance;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Finance.Queries.GetAccountTransactions;

public class GetAccountTransactionsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetAccountTransactionsQuery, PaginatedApiResponse<AccountTransactionResponse>>
{
    public async Task<PaginatedApiResponse<AccountTransactionResponse>> Handle(GetAccountTransactionsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        
        Expression<Func<Domain.Entities.Finance.AccountTransaction, AccountTransactionResponse>> projection = t => new AccountTransactionResponse
        {
            Id = t.Id,
            FromAccountId = t.FromAccountId,
            FromAccount = new AccountSummaryResponse
            {
                Id = t.FromAccount.Id,
                OfficeId = t.FromAccount.OfficeId,
                OfficeName = t.FromAccount.Office.Name,
                FundSourceId = t.FromAccount.FundSourceId,
                FundSourceName = t.FromAccount.FundSource != null ? t.FromAccount.FundSource.Name : null,
                FiscalYearId = t.FromAccount.FiscalYearId,
                FiscalYear = t.FromAccount.FiscalYear.Year,
                Name = t.FromAccount.Name,
                Balance = t.FromAccount.Balance
            },
            ToAccountId = t.ToAccountId,
            ToAccount = new AccountSummaryResponse
            {
                Id = t.ToAccount.Id,
                OfficeId = t.ToAccount.OfficeId,
                OfficeName = t.ToAccount.Office.Name,
                FundSourceId = t.ToAccount.FundSourceId,
                FundSourceName = t.ToAccount.FundSource != null ? t.ToAccount.FundSource.Name : null,
                FiscalYearId = t.ToAccount.FiscalYearId,
                FiscalYear = t.ToAccount.FiscalYear.Year,
                Name = t.ToAccount.Name,
                Balance = t.ToAccount.Balance
            },
            Purpose = t.Purpose,
            AmountTransfer = t.AmountTransfer,
            Code = t.Code,
            TransactionDate = t.TransactionDate,
            Status = t.Status.ToString(),
            AuthorizedByUserId = t.AuthorizedByUserId,
            AuthorizedDate = t.AuthorizedDate,
            CreatedAt = t.CreatedAt,
            CreatedBy = t.CreatedBy,
            UpdatedAt = t.UpdatedAt,
            UpdatedBy = t.UpdatedBy
        };

        var (transactions, totalCount) = await unitOfWork.AccountTransactionRepository
            .GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);

        return new PaginatedApiResponse<AccountTransactionResponse>(
            [.. transactions],
            query.PageNumber,
            query.PageSize,
            totalCount
        );
    }
}
