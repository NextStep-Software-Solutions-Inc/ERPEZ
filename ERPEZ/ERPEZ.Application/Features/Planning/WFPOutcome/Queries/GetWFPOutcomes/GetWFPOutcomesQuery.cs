using ERPEZ.Application.Common.Queries;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.WFPOutcome.Queries.GetWFPOutcomes;

public record GetWFPOutcomesQuery : PaginatedQuery<PaginatedApiResponse<Domain.Entities.Planning.WFPOutcome>>
{
}
