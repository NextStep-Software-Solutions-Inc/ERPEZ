using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Planning.UACSValidationRule.Dtos;

public record UpdateUACSValidationRuleRequest
{
    public required string RuleName { get; init; }
    public required string Description { get; init; }
    public Guid? CodeSegmentId { get; init; }
    public UACSSegmentTypeEnum? SegmentType { get; init; }
    public required string ValidationExpression { get; init; }
    public required string ErrorMessage { get; init; }
    public bool IsActive { get; init; }
    public int Priority { get; init; }
}
