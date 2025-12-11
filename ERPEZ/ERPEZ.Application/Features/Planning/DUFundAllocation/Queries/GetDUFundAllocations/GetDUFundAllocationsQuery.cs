using ERPEZ.Application.Common.Queries;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.DUFundAllocation.Queries.GetDUFundAllocations;

public record GetDUFundAllocationsQuery : PaginatedQuery<PaginatedApiResponse<Domain.Entities.Planning.DUFundAllocation>>
{
}
