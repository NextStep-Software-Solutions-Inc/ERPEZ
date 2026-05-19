namespace ERPEZ.Application.Features.Planning.OPCR.Dtos;

public record OPCRsResponse
{
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public Guid OfficeId { get; init; }
    public required string OfficeName { get; init; }
    public int FiscalYear { get; init; }
    public required decimal TotalBudget { get; init; }
    public DateOnly CreatedDate { get; init; }
    public required string CommitmentStatus { get; init; }
    public required string ReviewStatus { get; init; }
    public DateOnly? SubmittedDate { get; init; }
    public DateOnly? ReturnedDate { get; init; }
    public int EvaluationCount { get; init; } = 0;
    public int KPIAssignmentCount { get; init; } = 0;
    public int ActivityCount { get; init; } = 0;

}
