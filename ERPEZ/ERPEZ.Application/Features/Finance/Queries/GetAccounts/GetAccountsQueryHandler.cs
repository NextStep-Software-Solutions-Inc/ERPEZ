using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;
using ERPEZ.Domain.Dtos.Finance;

namespace ERPEZ.Application.Features.Finance.Queries.GetAccounts;

public class GetAccountsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetAccountsQuery, PaginatedApiResponse<AccountResponse>>
{
    public async Task<PaginatedApiResponse<AccountResponse>> Handle(GetAccountsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        
        Expression<Func<Domain.Entities.Finance.Account, AccountResponse>> projection = a => new AccountResponse
        {
            Id = a.Id,
            OfficeId = a.OfficeId,
            OfficeName = a.Office.Name,
            FundSourceId = a.FundSourceId,
            FundSourceName = a.FundSource != null ? a.FundSource.Name : null,
            FiscalYearId = a.FiscalYearId,
            FiscalYear = a.FiscalYear.Year,
            Name = a.Name,
            Balance = a.Balance,
            RunningBalance = a.RunningBalance,
            CreatedAt = a.CreatedAt,
            CreatedBy = a.CreatedBy,
            UpdatedAt = a.UpdatedAt,
            UpdatedBy = a.UpdatedBy
        };

        var (accounts, totalCount) = await unitOfWork.AccountRepository
            .GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);

        return new PaginatedApiResponse<AccountResponse>(
            [.. accounts],
            query.PageNumber,
            query.PageSize,
            totalCount
        );
    }
}
