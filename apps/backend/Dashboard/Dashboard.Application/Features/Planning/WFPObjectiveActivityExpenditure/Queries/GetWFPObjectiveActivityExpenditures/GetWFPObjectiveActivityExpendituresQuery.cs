using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.WFPObjectiveActivityExpenditure.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveActivityExpenditure.Queries.GetWFPObjectiveActivityExpenditures;

public record GetWFPObjectiveActivityExpendituresQuery : PaginatedQuery<PaginatedApiResponse<WFPObjectiveActivityExpenditureResponse>>
{
}
