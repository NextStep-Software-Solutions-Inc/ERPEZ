using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.ActivityBudgetRequirement.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.ActivityBudgetRequirement.Queries.GetABRs;

public record GetActivityBudgetRequirementsQuery : PaginatedQuery<PaginatedApiResponse<ActivityBudgetRequirementResponse>>
{
}
