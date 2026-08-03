using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Planning;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Master list of functional item categories (e.g., Office Supplies, IT Equipment)
/// Used to categorize both CSE and Non-CSE items for accurate procurement grouping.
/// </summary>
public class ItemCategory : BaseEntity
{
    public ItemCategory() { }

    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Description { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsActive { get; set; } = true;

    // Navigation Properties
    public virtual List<ProcurementItem> ProcurementItems { get; set; } = [];
    public virtual List<NonCSEItem> NonCSEItems { get; set; } = [];
}
