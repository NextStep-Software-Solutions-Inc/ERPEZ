using ERPEZ.Domain.Dtos.Finance;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Finance.Queries.GetAccountById;

public class GetAccountByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetAccountByIdQuery, ApiResponse<AccountResponse>>
{
    public async Task<ApiResponse<AccountResponse>> Handle(GetAccountByIdQuery request, CancellationToken cancellationToken)
    {
        var response = await unitOfWork.AccountRepository
            .Query(a => a.Id == request.Id)
            .Select(a => new AccountResponse
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
            })
            .FirstOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundException($"Account with ID {request.Id} not found.");

        return ApiResponse<AccountResponse>.Success(response);
    }
}
