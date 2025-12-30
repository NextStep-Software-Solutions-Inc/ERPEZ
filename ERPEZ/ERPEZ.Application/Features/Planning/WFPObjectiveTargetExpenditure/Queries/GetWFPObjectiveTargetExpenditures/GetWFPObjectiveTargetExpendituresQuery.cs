using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Queries.GetWFPObjectiveTargetExpenditures;

public record GetWFPObjectiveTargetExpendituresQuery : PaginatedQuery<PaginatedApiResponse<WFPObjectiveTargetExpenditureResponse>>
{
}
