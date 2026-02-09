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
    public string Status { get; set; } = "setup";

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
}
