using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Item Request - Requests for new procurement items not in CSE catalog
/// Used by offices to request addition of new items to procurement system
/// After approval, can be converted to NonCSEItem
/// </summary>
public class ItemRequest : BaseEntity
{
    public ItemRequest() { }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid OfficeId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? UOMId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? ProcurementCategoryId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string ItemCategory { get; set; } = string.Empty;
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string Status { get; set; } = string.Empty;
    
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal EstimatedUnitCost { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string? TechnicalSpecification { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string? TWGRemarks { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string? UACSCode { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string? UNSCPSCCode { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime RequestDate { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? ReviewedBy { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime? SubmittedAt { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime? ReviewedAt { get; set; }
    
    // Navigation properties
    public virtual Office Office { get; set; } = null!;
    public virtual UOM? UOM { get; set; }
    public virtual ProcurementCategory? ProcurementCategory { get; set; }
    public virtual List<NonCSEItem> NonCSEItems { get; set; } = [];
}
