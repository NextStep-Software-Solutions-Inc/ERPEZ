using ERPEZ.Application.Features.Planning.DUAllocation.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUAllocation.Queries.GetDUAllocationStats;

public class GetDUAllocationStatsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetDUAllocationStatsQuery, ApiResponse<DUAllocationStatsResponse>>
{
    public async Task<ApiResponse<DUAllocationStatsResponse>> Handle(GetDUAllocationStatsQuery request, CancellationToken cancellationToken)
    {
        
        

        var queryableDUFundAllocationsQuery = unitOfWork.DUFundAllocationRepository.SumAsync(duf => duf.Amount, cancellationToken);
        // Preparation for other queries as needed
        var results = await Task.WhenAll(queryableDUFundAllocationsQuery);

      
        var duAllocationStats = new DUAllocationStatsResponse
        {
            TotalAllocatedAmount = results[0],
            TotalUtilizedAmount = 0
        };
        
        return ApiResponse<DUAllocationStatsResponse>.Success(duAllocationStats, "Retrieved successfully");
    }
}
