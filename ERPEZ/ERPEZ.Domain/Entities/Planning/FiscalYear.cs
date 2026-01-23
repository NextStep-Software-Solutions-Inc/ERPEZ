using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class FiscalYear : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public int Year { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Description { get; set; }
    public bool IsLocked { get; set; } = false;

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
