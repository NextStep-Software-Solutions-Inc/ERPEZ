namespace ERPEZ.Application.Features.Planning.PositionType.Dtos;

public record PositionTypeResponse
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required string Code { get; init; }
    public string? Description { get; init; }
    public string? EducationalLevel { get; init; }
    public string? Category { get; init; }
    public required bool IsCareerEligibilityRequired { get; init; }
    public required bool CanReportDirectly { get; init; }
    public required bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
}
