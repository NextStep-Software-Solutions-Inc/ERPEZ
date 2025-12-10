using ERPEZ.Application.Common.Queries;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.OPCR.Queries.GetOPCRs;

public record GetOPCRsQuery : PaginatedQuery<PaginatedApiResponse<Domain.Entities.Planning.OPCR>>
{
}
