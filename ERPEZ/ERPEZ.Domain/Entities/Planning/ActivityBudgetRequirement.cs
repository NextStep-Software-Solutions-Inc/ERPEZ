using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class ActivityBudgetRequirement : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid WFPObjectiveTargetId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ObjectId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string? ItemDescription { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public int Quantity { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal CostEstimates { get; set; }



    public virtual WFPObjectiveTarget WFPObjectiveTarget { get; set; } = null!;
    public virtual Object Object { get; set; } = null!;
}
