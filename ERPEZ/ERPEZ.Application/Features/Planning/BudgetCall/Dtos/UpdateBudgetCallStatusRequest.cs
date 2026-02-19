namespace ERPEZ.Application.Features.Planning.BudgetCall.Dtos;

public record UpdateBudgetCallStatusRequest
{
    public required string Status { get; init; }
}
