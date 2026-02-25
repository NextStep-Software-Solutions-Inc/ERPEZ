using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class FiscalYear : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public int Year { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Description { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string Status { get; set; } = "Setup";

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsLocked { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime? StartDate { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime? EndDate { get; set; }

    /// <summary>
    /// Navigation property for fiscal months.
    /// </summary>
    public virtual List<FiscalMonth> FiscalMonths { get; set; } = [];

    /// <summary>
    /// Navigation property for budget calls.
    /// </summary>
    public virtual List<BudgetCall> BudgetCalls { get; set; } = [];

    /// <summary>
    /// Navigation property for function allocations.
    /// </summary>
    public List<FunctionAllocation> FunctionAllocations { get; set; } = [];

    /// <summary>
    /// Navigation property for UACS code segment fiscal year associations.
    /// </summary>
    public virtual List<UACSCodeSegmentFiscalYear> UACSCodeSegmentFiscalYears { get; set; } = [];

    /// <summary>
    /// Navigation property for UACS code combination fiscal year associations.
    /// </summary>
    public virtual List<UACSCodeCombinationFiscalYear> UACSCodeCombinationFiscalYears { get; set; } = [];

    /// <summary>
    /// Navigation property for function configurations.
    /// </summary>
    public virtual List<FunctionConfig> FunctionConfigs { get; set; } = [];

    /// <summary>
    /// Navigation property for procurement policy configurations.
    /// </summary>
    public virtual List<ProcurementPolicyConfig> ProcurementPolicyConfigs { get; set; } = [];

    /// <summary>
    /// Navigation property for general rating scales.
    /// </summary>
    public virtual List<GeneralRatingScale> GeneralRatingScales { get; set; } = [];

    /// <summary>
    /// Navigation property for economic indicators.
    /// </summary>
    public virtual List<EconomicIndicator> EconomicIndicators { get; set; } = [];

    /// <summary>
    /// Navigation property for workflow matrices.
    /// </summary>
    public virtual List<WorkflowMatrix> WorkflowMatrices { get; set; } = [];
}
