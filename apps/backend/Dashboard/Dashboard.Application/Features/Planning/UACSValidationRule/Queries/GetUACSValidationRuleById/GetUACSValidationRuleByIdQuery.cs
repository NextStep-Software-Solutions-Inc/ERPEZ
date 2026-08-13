using ERPEZ.Application.Features.Planning.UACSValidationRule.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSValidationRule.Queries.GetUACSValidationRuleById;

public record GetUACSValidationRuleByIdQuery(Guid Id) : IRequest<ApiResponse<UACSValidationRuleResponse>>;
