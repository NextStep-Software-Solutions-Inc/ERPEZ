namespace ERPEZ.Application.Features.Planning.SalaryGrade.Dtos;

public record UpdateSalaryGradeRequest
{
    public string? Name { get; init; }
    public string? Code { get; init; }
    public int? GradeNumber { get; init; }
    public decimal? StepIncrementAmount { get; init; }
    public int? NumberOfSteps { get; init; }
    public DateOnly? EffectiveDate { get; init; }
    public string? Description { get; init; }
    public bool? IsActive { get; init; }
}
