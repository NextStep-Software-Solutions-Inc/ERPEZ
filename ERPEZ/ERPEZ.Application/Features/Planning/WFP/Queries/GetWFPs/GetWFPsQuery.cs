using ERPEZ.Application.Common.Queries;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.WFP.Queries.GetWFPs;

public record GetWFPsQuery : PaginatedQuery<PaginatedApiResponse<Domain.Entities.Planning.WFP>>
{
}
