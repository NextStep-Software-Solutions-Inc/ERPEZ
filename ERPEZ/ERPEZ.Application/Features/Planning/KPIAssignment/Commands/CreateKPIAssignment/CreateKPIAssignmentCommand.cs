using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIAssignment.Commands.CreateKPIAssignment;

public record CreateKPIAssignmentCommand : IRequest<ApiResponse<Guid>>
{
    public Guid FYActiveKPIId { get; init; }
    public Guid OfficeId { get; init; }
    
    /// <summary>
    /// Source of the assignment: "Assigned" (by Planning) or "Shopped" (by Office).
    /// Defaults to "Assigned". If "Shopped", AssignedTargetAnnual should be null.
    /// </summary>
    public string Source { get; init; } = "Assigned";
    
    /// <summary>
    /// Annual target for the Office.
    /// Required if Source is "Assigned"; should be null if Source is "Shopped".
    /// </summary>
    public decimal? AssignedTargetAnnual { get; init; }
    
    public decimal? AssignedTargetQ1 { get; init; }
    public decimal? AssignedTargetQ2 { get; init; }
    public decimal? AssignedTargetQ3 { get; init; }
    public decimal? AssignedTargetQ4 { get; init; }
    public bool IsLocked { get; init; } = false;
}
