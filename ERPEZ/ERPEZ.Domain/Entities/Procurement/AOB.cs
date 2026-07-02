using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Abstract of Bids (AOB) Header.
/// </summary>
public class AOB : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public string AOBNumber { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Description { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string AwardCriterion { get; set; } = "LCRB"; // E.g., LCRB, MEARB, MARB

    [Sieve(CanFilter = true, CanSort = true)]
    public DateOnly AOBDate { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime OpeningDate { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string Status { get; set; } = "DRAFT"; // DRAFT, FOR_APPROVAL, APPROVED

    // Navigation properties
    public virtual List<AOBProcurementProjectMapping> AOBProcurementProjectMappings { get; set; } = [];
    public virtual List<AOBAwardedItem> AOBAwardedItems { get; set; } = [];
}
