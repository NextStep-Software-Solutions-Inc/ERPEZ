using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.PPMPItemAllocation.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.PPMPItemAllocation.Queries.GetPPMPItemAllocations;

public record GetPPMPItemAllocationsQuery : PaginatedQuery<PaginatedApiResponse<PPMPItemAllocationResponse>>;
