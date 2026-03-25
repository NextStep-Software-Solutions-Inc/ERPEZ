namespace ERPEZ.Domain.Enums;

/// <summary>
/// Defines the source/origin of a KPI assignment to an Office.
/// Distinguishes between mandated assignments (from Planning) and self-selection (by Office).
/// </summary>
public enum KPIAssignmentSourceEnum
{
    /// <summary>
    /// The KPI was assigned by Planning to the Office (mandated).
    /// AssignedTargetAnnual inherits the assigned value from Planning.
    /// Quarterly targets (Q1-Q4) are required when provided.
    /// </summary>
    Assigned = 0,

    /// <summary>
    /// The Office selected/shopped this KPI from available KPIs (self-selection).
    /// AssignedTargetAnnual and quarterly targets (Q1-Q4) must be NULL at creation.
    /// Office proposes their own target later.
    /// </summary>
    Shopped = 1
}
