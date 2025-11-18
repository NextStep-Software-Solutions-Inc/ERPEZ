using ERPEZ.Application.Features.Planning.FundSource.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FundSource.Queries.GetFundSourceById;

public class GetFundSourceByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetFundSourceByIdQuery, ApiResponse<FundSourceResponse>>
{
    public async Task<ApiResponse<FundSourceResponse>> Handle(GetFundSourceByIdQuery request, CancellationToken cancellationToken)
    {
        var fundSource = await unitOfWork.FundSourceRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        var result = new FundSourceResponse()
        {
            Id = fundSource.Id,
            ParentId = fundSource.ParentId,
            Name = fundSource.Name,
            Code = fundSource.Code,
            TotalDUAllocatedFunds = fundSource.ReceivedFunds
                .SelectMany(rf => rf.DUFundAllocations)
                .Sum(dufa => dufa.Amount),
            TotalReceivedFunds = fundSource.ReceivedFunds.Sum(rf => rf.Amount),
            Type = fundSource.Type.ToString(),
            IsActive = fundSource.IsActive,
            CreatedBy = fundSource.CreatedBy,
            CreatedAt = fundSource.CreatedAt
        };
        return ApiResponse<FundSourceResponse>.Success(result, "Retrieved successfully");
    }
}
