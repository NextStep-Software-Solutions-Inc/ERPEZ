using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class BudgetAllocation : BaseEntity
{
    public BudgetAllocation() { }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid LineItemBudgetDetailId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string BudgetPeriod { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime StartDate { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime EndDate { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal TotalAllocated { get; set; }

    // Navigation properties
    public virtual LineItemBudgetDetail LineItemBudgetDetail { get; set; } = null!;
}
