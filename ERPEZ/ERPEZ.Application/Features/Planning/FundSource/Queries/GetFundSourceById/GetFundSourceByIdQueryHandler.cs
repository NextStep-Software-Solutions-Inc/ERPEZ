using ERPEZ.Application.Features.Planning.FundSource.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FundSource.Queries.GetFundSourceById;

public class GetFundSourceByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetFundSourceByIdQuery, ApiResponse<FundSourceResponse>>
{
    public async Task<ApiResponse<FundSourceResponse>> Handle(GetFundSourceByIdQuery request, CancellationToken cancellationToken)
    {
        var accountsQuery = unitOfWork.AccountRepository.Query();
        var transactionsQuery = unitOfWork.AccountTransactionRepository.Query(t => t.Status == StatusEnum.Completed);

        var query = unitOfWork.FundSourceRepository.Query(f => f.Id == request.Id)
            .Select(fundSource => new FundSourceResponse
            {
                Id = fundSource.Id,
                ParentId = fundSource.ParentId,
                Name = fundSource.Name,
                Code = fundSource.Code,
                TotalDUAllocatedFunds = accountsQuery
                    .Where(a => a.FundSourceId == fundSource.Id)
                    .Select(a => a.Balance)
                    .DefaultIfEmpty(0m)
                    .Sum(),
                TotalReceivedFunds = transactionsQuery
                    .Where(t => t.ToAccount.FundSourceId == fundSource.Id)
                    .Select(t => t.AmountTransfer)
                    .DefaultIfEmpty(0m)
                    .Sum(),
                Type = fundSource.Type.ToString(),
                IsActive = fundSource.IsActive,
                CreatedBy = fundSource.CreatedBy,
                CreatedAt = fundSource.CreatedAt
            });

        var result = await unitOfWork.FundSourceRepository.GetFirstAsync(query, cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<FundSourceResponse>.Success(result, "Retrieved successfully");
    }
}
