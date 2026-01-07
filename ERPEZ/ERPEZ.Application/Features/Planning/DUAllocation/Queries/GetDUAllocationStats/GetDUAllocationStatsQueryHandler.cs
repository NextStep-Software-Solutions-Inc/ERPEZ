using ERPEZ.Application.Features.Planning.DUAllocation.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUAllocation.Queries.GetDUAllocationStats;

public class GetDUAllocationStatsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetDUAllocationStatsQuery, ApiResponse<DUAllocationStatsResponse>>
{
    public async Task<ApiResponse<DUAllocationStatsResponse>> Handle(GetDUAllocationStatsQuery request, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            Filters = request.Filters
        };

        var totalAllocatedAmount = await unitOfWork.DUFundAllocationRepository.SumAsync(sieveModel, duf => duf.Amount, cancellationToken);
        var totalReceivedAmount = await unitOfWork.ReceivedFundRepository.SumAsync(sieveModel, du => du.Amount, cancellationToken);

        var duAllocationStats = new DUAllocationStatsResponse
        {
            TotalAllocatedAmount = totalAllocatedAmount,
            TotalReceivedAmount = totalReceivedAmount,
            TotalUtilizedAmount = 0
        };
        
        return ApiResponse<DUAllocationStatsResponse>.Success(duAllocationStats, "Retrieved successfully");
    }
}
