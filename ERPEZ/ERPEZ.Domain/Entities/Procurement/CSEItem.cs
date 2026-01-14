using ERPEZ.Domain.Common;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Common Supply and Equipment Items (Master list)
/// Type: Expendable, Semi-expendable, Equipment, PPE
/// Source: PSDBM (Philippine Standard Database for Medicines and supplies)
/// </summary>
public class CSEItem : BaseEntity
{
    public CSEItem() { }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;
    
    /// <summary>
    /// EF Config: .HasConversion<string>()
    /// Values: Expendable, SemiExpendable, Equipment, PPE
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public CSEItemType Type { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string? Description { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string Unit { get; set; } = string.Empty;
    
    [Sieve(CanFilter = true, CanSort = true)]
    public int? ItemLife { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string? ProductCode { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal Price { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string? ImageURL { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string? Remarks { get; set; }
}
