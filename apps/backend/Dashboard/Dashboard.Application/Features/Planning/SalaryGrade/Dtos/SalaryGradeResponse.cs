namespace ERPEZ.Application.Features.Planning.SalaryGrade.Dtos;

public record SalaryGradeResponse
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required string Code { get; init; }
    public required int GradeNumber { get; init; }
    public decimal? StepIncrementAmount { get; init; }
    public required int NumberOfSteps { get; init; }
    public required DateOnly EffectiveDate { get; init; }
    public string? Description { get; init; }
    public required bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
}
