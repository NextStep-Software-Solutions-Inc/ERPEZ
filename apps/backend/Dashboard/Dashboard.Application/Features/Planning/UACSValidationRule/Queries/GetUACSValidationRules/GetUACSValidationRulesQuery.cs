using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.UACSValidationRule.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.UACSValidationRule.Queries.GetUACSValidationRules;

public record GetUACSValidationRulesQuery : PaginatedQuery<PaginatedApiResponse<UACSValidationRuleResponse>>
{
}
