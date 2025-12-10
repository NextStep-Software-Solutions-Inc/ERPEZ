using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.DUAllocation.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.DUAllocation.Queries.GetDUAllocations;

public record GetDUAllocationsQuery : PaginatedQuery<PaginatedApiResponse<DUAllocationResponse>>
{

}
