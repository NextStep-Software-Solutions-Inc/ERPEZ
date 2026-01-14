using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Non-Common Supply and Equipment Items (Manual entry items)
/// Items not found in the CSE master list
/// </summary>
public class NonCSEItem : BaseEntity
{
    public NonCSEItem() { }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string? Description { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string Unit { get; set; } = string.Empty;
    
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
}
