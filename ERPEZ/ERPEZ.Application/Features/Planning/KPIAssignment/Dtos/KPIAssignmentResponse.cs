namespace ERPEZ.Application.Features.Planning.KPIAssignment.Dtos;

public record KPIAssignmentResponse
{
    public Guid Id { get; init; }
    public Guid FYActiveKPIId { get; init; }
    public Guid OfficeId { get; init; }
    public string OfficeName { get; init; } = string.Empty;
    public decimal AssignedTargetAnnual { get; init; }
    public decimal? AssignedTargetQ1 { get; init; }
    public decimal? AssignedTargetQ2 { get; init; }
    public decimal? AssignedTargetQ3 { get; init; }
    public decimal? AssignedTargetQ4 { get; init; }
    public bool IsLocked { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
}
