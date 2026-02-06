using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.BudgetCall.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.BudgetCall.Queries.GetBudgetCalls;

public record GetBudgetCallsQuery : PaginatedQuery<PaginatedApiResponse<BudgetCallResponse>>
{
}
