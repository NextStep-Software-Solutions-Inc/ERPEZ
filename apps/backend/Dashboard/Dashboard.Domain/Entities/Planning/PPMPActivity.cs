using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// PPMP Activity - Junction table linking PPMP to LineItemBudgetActivity
/// Represents activities included in the PPMP procurement plan
/// </summary>
public class PPMPActivity : TenantScopedEntity
{
    public PPMPActivity() { }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid PPMPId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid LIBActivityId { get; set; }
    
    // Navigation properties
    public virtual PPMP PPMP { get; set; } = null!;
    public virtual LineItemBudgetActivity LIBActivity { get; set; } = null!;
    public virtual List<PPMPExpenditureItem> PPMPExpenditureItems { get; set; } = [];
}
