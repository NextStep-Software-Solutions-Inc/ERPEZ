using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIAssignment.Commands.BulkCreateKPIAssignment;

/// <summary>
/// Bulk create KPI assignments for multiple offices per KPI
/// </summary>
public record BulkCreateKPIAssignmentCommand(List<KPIOfficeAssignmentRequest> Assignments) 
    : IRequest<ApiResponse<BulkAssignmentResult>>;

/// <summary>
/// Represents a KPI with its office assignments
/// </summary>
public record KPIOfficeAssignmentRequest
{
    public Guid FYActiveKPIId { get; init; }
    public List<OfficeTargetAssignment> OfficeAssignments { get; init; } = [];
}

/// <summary>
/// Represents target assignment for a single office
/// </summary>
public record OfficeTargetAssignment
{
    public Guid OfficeId { get; init; }
    public decimal AssignedTargetAnnual { get; init; }
    public decimal? AssignedTargetQ1 { get; init; }
    public decimal? AssignedTargetQ2 { get; init; }
    public decimal? AssignedTargetQ3 { get; init; }
    public decimal? AssignedTargetQ4 { get; init; }
    public bool IsLocked { get; init; } = false;
}

/// <summary>
/// Result of bulk assignment operation
/// </summary>
public record BulkAssignmentResult
{
    public int TotalKPIsProcessed { get; init; }
    public int TotalOfficesAssigned { get; init; }
    public List<Guid> CreatedAssignmentIds { get; init; } = [];
}
