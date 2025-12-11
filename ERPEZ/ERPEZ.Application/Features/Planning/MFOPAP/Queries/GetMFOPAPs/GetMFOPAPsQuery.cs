using ERPEZ.Application.Common.Queries;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.MFOPAP.Queries.GetMFOPAPs;

public record GetMFOPAPsQuery : PaginatedQuery<PaginatedApiResponse<Domain.Entities.Planning.MFOPAP>>
{
}
