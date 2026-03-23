using ERPEZ.Application.Features.Planning.FYActiveKPI.Dtos;
using ERPEZ.Application.Features.Planning.Office.Dtos;

namespace ERPEZ.Application.Features.Planning.KPIAssignment.Dtos;

public record KPIAssignmentResponse
{
    public Guid Id { get; init; }
    public Guid FYActiveKPIId { get; init; }
    public Guid OfficeId { get; init; }
    public string OfficeName { get; init; } = string.Empty;
    
    /// <summary>
    /// Source of the assignment: "Assigned" (by Planning) or "Shopped" (by Office).
    /// </summary>
    public string Source { get; init; } = "Assigned";
    
    /// <summary>
    /// Annual target for the Office.
    /// Null if Source="Shopped"; has value if Source="Assigned".
    /// </summary>
    public decimal? AssignedTargetAnnual { get; init; }
    
    public decimal? AssignedTargetQ1 { get; init; }
    public decimal? AssignedTargetQ2 { get; init; }
    public decimal? AssignedTargetQ3 { get; init; }
    public decimal? AssignedTargetQ4 { get; init; }
    public bool IsLocked { get; init; }
    public FYActiveKPIResponse? FYActiveKPI { get; init; }
    public OfficeResponse? Office { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
}
