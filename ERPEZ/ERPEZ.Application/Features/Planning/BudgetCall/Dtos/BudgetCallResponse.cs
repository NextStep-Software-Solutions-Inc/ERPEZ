namespace ERPEZ.Application.Features.Planning.BudgetCall.Dtos;

public record BudgetCallResponse
{
    public Guid Id { get; init; }
    public Guid FiscalYearId { get; init; }
    public string? Type { get; init; }
    public DateTime SubmissionDeadline { get; init; }
    public DateTime CreatedAt { get; init; }
}
