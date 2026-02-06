namespace ERPEZ.Application.Features.Planning.BudgetCall.Dtos;

public record BudgetCallDetailedResponse
{
    public Guid Id { get; init; }
    public Guid FiscalYearId { get; init; }
    public string? Type { get; init; }
    public DateTime SubmissionDeadline { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
    public DateTime? UpdatedAt { get; init; }
    public string? UpdatedBy { get; init; }
}
