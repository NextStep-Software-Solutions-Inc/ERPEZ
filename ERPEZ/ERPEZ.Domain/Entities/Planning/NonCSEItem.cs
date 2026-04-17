using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Non-Common Supply and Equipment Items (Manual entry items)
/// Items not found in the CSE master list
/// Can be created from approved ItemRequests or added manually
/// </summary>
public class NonCSEItem : BaseEntity
{
    public NonCSEItem() { }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? UOMId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? ItemRequestId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string? ProductCode { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string? Description { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal CurrentPrice { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal BaseCost { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal Margin { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal SellingPrice { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public int? ItemLife { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string Type { get; set; } = string.Empty;
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string Status { get; set; } = string.Empty;
    
    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsActive { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string? Remarks { get; set; }
    
    // Navigation properties
    public virtual UOM? UOM { get; set; }
    public virtual ItemRequest? ItemRequest { get; set; }
    public virtual List<PPMPItem> PPMPItems { get; set; } = [];
}
