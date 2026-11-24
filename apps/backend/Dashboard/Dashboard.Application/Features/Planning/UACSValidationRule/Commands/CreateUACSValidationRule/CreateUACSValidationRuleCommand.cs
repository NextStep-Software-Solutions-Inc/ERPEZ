using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSValidationRule.Commands.CreateUACSValidationRule;

public class CreateUACSValidationRuleCommand : IRequest<ApiResponse<Guid>>
{
    public string RuleName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid? CodeSegmentId { get; set; }
    public UACSSegmentTypeEnum? SegmentType { get; set; }
    public string ValidationExpression { get; set; } = string.Empty;
    public string ErrorMessage { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public int Priority { get; set; }
}
