using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Other;

/// <summary>
/// Individual procurement items in PPMP
/// Note: IsNonCSE is a flag used to identify non-cse manual entry items.  
///       If Non-CSE there is no CSEItemId, CSEItem = PSDBM
///       The procurement project name and code in an APP item should be copied directly 
///       from the corresponding PPMP item.
/// </summary>
public class PPMPItem : BaseEntity
{
    public PPMPItem() { }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid PPMPId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid LineItemBudgetDetailId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? CSEItemId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? NonCSEItemId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ProcurementModelId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public List<string> PAPCode { get; set; } = new();
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string? Description { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string Unit { get; set; } = string.Empty;
    
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal UnitCost { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsNonCSE { get; set; }
}
