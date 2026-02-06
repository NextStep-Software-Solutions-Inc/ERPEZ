namespace ERPEZ.Application.Features.Planning.Position.Dtos;

public record UpdatePositionRequest
{
    public string? Title { get; init; }
    public string? FunctionalTitle { get; init; }
    public string? Code { get; init; }
    public string? JobDescription { get; init; }
    public string? Qualifications { get; init; }
    public decimal? FTE { get; init; }
    public string? OperationalStatus { get; init; }
    public Guid? PositionTypeId { get; init; }
    public Guid? PlantillaTypeId { get; init; }
    public Guid? SalaryGradeId { get; init; }
    public Guid? StepId { get; init; }
    public Guid? OfficeId { get; init; }
}
