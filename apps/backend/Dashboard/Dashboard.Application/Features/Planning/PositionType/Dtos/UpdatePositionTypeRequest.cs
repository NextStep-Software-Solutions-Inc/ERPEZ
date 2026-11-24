namespace ERPEZ.Application.Features.Planning.PositionType.Dtos;

public record UpdatePositionTypeRequest
{
    public string? Name { get; init; }
    public string? Code { get; init; }
    public string? Description { get; init; }
    public string? EducationalLevel { get; init; }
    public string? Category { get; init; }
    public bool? IsCareerEligibilityRequired { get; init; }
    public bool? CanReportDirectly { get; init; }
    public bool? IsActive { get; init; }
}
