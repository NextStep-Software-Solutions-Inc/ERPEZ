namespace ERPEZ.Application.Features.Planning.Position.Dtos;

public record PositionResponse
{
    public required Guid Id { get; init; }
    public required string Title { get; init; }
    public string? FunctionalTitle { get; init; }
    public required string Code { get; init; }
    public string? JobDescription { get; init; }
    public string? Qualifications { get; init; }
    public decimal? FTE { get; init; }
    public required string OperationalStatus { get; init; }
    public required Guid PositionTypeId { get; init; }
    public required Guid PlantillaTypeId { get; init; }
    public required Guid SalaryGradeId { get; init; }
    public required Guid StepId { get; init; }
    public required Guid OfficeId { get; init; }
    public required DateTime CreatedAt { get; init; }
}
