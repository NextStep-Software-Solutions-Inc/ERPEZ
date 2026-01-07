namespace ERPEZ.Application.Features.Planning.OPCR.Dtos;

public record OPCRsResponse
{
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public Guid DeliveryUnitId { get; init; }
    public required string OfficeName { get; init; }
    public int FiscalYear { get; init; }
    public required decimal TotalBudget { get; init; }
    public DateOnly CreatedDate { get; init; }
    public string Status { get; init; } = string.Empty;

    public int EvaluationCount { get; init; } = 0;
    public int KPITargetAssignmentCount { get; init; } = 0;
    public int ActivityCount { get; init; } = 0;

}
