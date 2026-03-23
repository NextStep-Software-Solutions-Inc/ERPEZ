namespace ERPEZ.Domain.Enums;

/// <summary>
/// Defines the source/origin of a KPI assignment to an Office.
/// Distinguishes between mandated assignments (from Planning) and self-selection (by Office).
/// </summary>
public enum KPIAssignmentSourceEnum
{
    /// <summary>
    /// The KPI was assigned by Planning to the Office (mandated).
    /// AssignedTargetAnnual inherits the assigned value.
    /// IsProposed = false.
    /// </summary>
    Assigned = 0,

    /// <summary>
    /// The Office selected/shopped this KPI from available KPIs (self-selection).
    /// AssignedTargetAnnual is NULL (Office proposes their own target later).
    /// IsProposed = true.
    /// </summary>
    Shopped = 1
}
