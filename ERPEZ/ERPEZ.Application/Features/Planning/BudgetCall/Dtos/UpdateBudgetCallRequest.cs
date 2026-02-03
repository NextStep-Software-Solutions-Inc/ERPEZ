namespace ERPEZ.Application.Features.Planning.BudgetCall.Dtos;

public record UpdateBudgetCallRequest
{
    public required string Type { get; init; }
    public DateTime SubmissionDeadline { get; init; }
}
