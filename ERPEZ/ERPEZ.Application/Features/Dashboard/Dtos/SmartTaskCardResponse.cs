namespace ERPEZ.Application.Features.Dashboard.Dtos;

/// <summary>
/// Smart Task Card with embedded dashboard statistics.
/// </summary>
public record SmartTaskCardResponse
{
    /// <summary>
    /// Unique task identifier.
    /// </summary>
    public Guid TaskId { get; init; }

    /// <summary>
    /// Task priority level.
    /// </summary>
    public TaskPriority Priority { get; init; }

    /// <summary>
    /// Task due date.
    /// </summary>
    public  DateTime? DueDate { get; init; }

    /// <summary>
    /// User ID to whom the task is assigned.
    /// </summary>
    public Guid AssignedToUserId { get; init; }

    /// <summary>
    /// User name to whom the task is assigned.
    /// </summary>
    public string AssignedToUserName { get; init; } = string.Empty;

    /// <summary>
    /// Task type (OPCR, WFP, Budget, Strategy, Procurement).
    /// </summary>
    public TaskType TaskType { get; init; }

    /// <summary>
    /// Primary action title (e.g., "Approve Q2 OPCR Submission").
    /// </summary>
    public string ActionTitle { get; init; } = string.Empty;

    /// <summary>
    /// Task description or additional context.
    /// </summary>
    public string Description { get; init; } = string.Empty;

    /// <summary>
    /// Related entity ID (OPCR ID, WFP ID, Budget ID, etc.).
    /// </summary>
    public Guid? RelatedEntityId { get; init; }

    /// <summary>
    /// Related entity type (e.g., "OPCR", "WFP", "LineItemBudget").
    /// </summary>
    public string RelatedEntityType { get; init; } = string.Empty;

    /// <summary>
    /// Contextual dashboard statistics for this task.
    /// </summary>
    public TaskContextStatistics? ContextStatistics { get; init; }

    /// <summary>
    /// Strategic link (MFO Reference or related goal).
    /// </summary>
    public StrategicLink? StrategicLink { get; init; }

    /// <summary>
    /// Date the task was created.
    /// </summary>
    public DateTime CreatedAt { get; init; }

    /// <summary>
    /// Current status of the task.
    /// </summary>
    public string Status { get; init; } = string.Empty;
}

/// <summary>
/// Task priority levels.
/// </summary>
public enum TaskPriority
{
    Low,
    Medium,
    High,
    Critical
}

/// <summary>
/// Task types aligned with dashboard modules.
/// </summary>
public enum TaskType
{
    OPCR,
    WFP,
    WFPExternal,
    Budget,
    Strategy,
    Procurement
}

/// <summary>
/// Contextual dashboard statistics embedded in task card (polymorphic).
/// </summary>
public record TaskContextStatistics
{
    /// <summary>
    /// OPCR-specific statistics (when TaskType = OPCR).
    /// </summary>
    public OPCRTaskContext? OPCRContext { get; init; }

    /// <summary>
    /// WFP (External) statistics (when TaskType = WFPExternal).
    /// </summary>
    public WFPTaskContext? WFPContext { get; init; }

    /// <summary>
    /// Budget-specific statistics (when TaskType = Budget).
    /// </summary>
    public BudgetTaskContext? BudgetContext { get; init; }

    /// <summary>
    /// Procurement (PPMP/APP) statistics (when TaskType = Procurement).
    /// </summary>
    public ProcurementTaskContext? ProcurementContext { get; init; }
}

/// <summary>
/// OPCR task context showing planned vs actual commitment.
/// </summary>
public record OPCRTaskContext
{
    /// <summary>
    /// Planned commitment amount for the OPCR.
    /// </summary>
    public decimal PlannedAmount { get; init; }

    /// <summary>
    /// Actual commitment amount so far.
    /// </summary>
    public decimal ActualAmount { get; init; }

    /// <summary>
    /// Completion percentage (Actual / Planned * 100).
    /// </summary>
    public decimal CompletionPercentage { get; init; }

    /// <summary>
    /// OPCR status (Draft, Submitted, Under Review, Approved, etc.).
    /// </summary>
    public string Status { get; init; } = string.Empty;

    /// <summary>
    /// Number of activities in the OPCR.
    /// </summary>
    public int ActivityCount { get; init; }
}

/// <summary>
/// WFP (External) task context showing fund utilization.
/// </summary>
public record WFPTaskContext
{
    /// <summary>
    /// Total proposed budget for the WFP.
    /// </summary>
    public decimal TotalBudget { get; init; }

    /// <summary>
    /// Utilized budget amount.
    /// </summary>
    public decimal UtilizedAmount { get; init; }

    /// <summary>
    /// Budget utilization percentage (0-100+).
    /// </summary>
    public decimal UtilizationPercentage { get; init; }

    /// <summary>
    /// Remaining balance.
    /// </summary>
    public decimal RemainingBalance { get; init; }

    /// <summary>
    /// WFP status.
    /// </summary>
    public string Status { get; init; } = string.Empty;

    /// <summary>
    /// Project start date.
    /// </summary>
    public DateTime? ProjectStartDate { get; init; }

    /// <summary>
    /// Project end date.
    /// </summary>
    public DateTime? ProjectEndDate { get; init; }
}

/// <summary>
/// Budget task context showing line-item utilization.
/// </summary>
public record BudgetTaskContext
{
    /// <summary>
    /// UACS code or object code.
    /// </summary>
    public string UACSCode { get; init; } = string.Empty;

    /// <summary>
    /// Budget line item description.
    /// </summary>
    public string LineItemDescription { get; init; } = string.Empty;

    /// <summary>
    /// Allocated budget for this line item.
    /// </summary>
    public decimal AllocatedAmount { get; init; }

    /// <summary>
    /// Utilized amount so far.
    /// </summary>
    public decimal UtilizedAmount { get; init; }

    /// <summary>
    /// Utilization percentage (0-100+).
    /// </summary>
    public decimal UtilizationPercentage { get; init; }

    /// <summary>
    /// Warning level: "Normal" (<80%), "Warning" (80-95%), "Critical" (>95%).
    /// </summary>
    public string WarningLevel { get; init; } = string.Empty;
}

/// <summary>
/// Procurement (PPMP/APP) task context showing consolidation progress.
/// </summary>
public record ProcurementTaskContext
{
    /// <summary>
    /// Total number of PPMP items.
    /// </summary>
    public int TotalItems { get; init; }

    /// <summary>
    /// Number of consolidated items.
    /// </summary>
    public int ConsolidatedItems { get; init; }

    /// <summary>
    /// Consolidation progress percentage (0-100).
    /// </summary>
    public decimal ConsolidationProgress { get; init; }

    /// <summary>
    /// Number of pending items.
    /// </summary>
    public int PendingItems { get; init; }

    /// <summary>
    /// PPMP status.
    /// </summary>
    public string Status { get; init; } = string.Empty;
}

/// <summary>
/// Strategic link showing what broader goal the task supports.
/// </summary>
public record StrategicLink
{
    /// <summary>
    /// MFO or strategic goal ID.
    /// </summary>
    public Guid MFOId { get; init; }

    /// <summary>
    /// MFO reference code (e.g., "MFO 1").
    /// </summary>
    public string MFOCode { get; init; } = string.Empty;

    /// <summary>
    /// MFO title (e.g., "Policy Formulation").
    /// </summary>
    public string MFOTitle { get; init; } = string.Empty;

    /// <summary>
    /// MFO status (On Track, At Risk, Delayed, Completed).
    /// </summary>
    public string MFOStatus { get; init; } = string.Empty;
}
