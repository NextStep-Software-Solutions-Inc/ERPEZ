using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIAssignment.Commands.BulkUpdateKPIAssignmentLockStatus;

/// <summary>
/// Bulk update lock status for KPI assignments grouped by FYActiveKPI.
/// </summary>
public record BulkUpdateKPIAssignmentLockStatusCommand(List<KPIOfficeLockStatusRequest> Assignments)
    : IRequest<ApiResponse<BulkLockStatusUpdateResult>>;

/// <summary>
/// Represents lock/unlock updates for one FYActiveKPI across multiple offices.
/// </summary>
public record KPIOfficeLockStatusRequest
{
    public Guid FYActiveKPIId { get; init; }
    public List<OfficeLockStatusUpdate> OfficeAssignments { get; init; } = [];
}

/// <summary>
/// Represents lock status update for a specific office assignment.
/// </summary>
public record OfficeLockStatusUpdate
{
    public Guid OfficeId { get; init; }
    public bool IsLocked { get; init; }
}

/// <summary>
/// Result of bulk lock/unlock operation.
/// </summary>
public record BulkLockStatusUpdateResult
{
    public int TotalKPIsProcessed { get; init; }
    public int TotalAssignmentsUpdated { get; init; }
    public List<Guid> UpdatedAssignmentIds { get; init; } = [];
}
