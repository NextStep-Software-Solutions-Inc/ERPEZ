using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.DUFundAllocation.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.DUFundAllocation.Queries.GetDUFundAllocations;

public record GetDUFundAllocationsQuery : PaginatedQuery<PaginatedApiResponse<DUFundAllocationsResponse>>
{
}
