using ERPEZ.Application.Features.Planning.UACSValidationRule.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSValidationRule.Commands.UpdateUACSValidationRule;

public class UpdateUACSValidationRuleCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; set; }
    public required UpdateUACSValidationRuleRequest UpdateUACSValidationRule { get; set; }
}
