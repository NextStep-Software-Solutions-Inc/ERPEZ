using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Represents the price schedule for a procurement item in a specific fiscal year.
/// Ensures only one price record exists per ProcurementItem per FiscalYear.
/// </summary>
public class ItemPrice : TenantScopedEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal UnitPrice { get; set; }

    // Foreign Keys
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ProcurementItemId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid FiscalYearId { get; set; }

    // Navigation Properties
    public virtual ProcurementItem? ProcurementItem { get; set; }
    public virtual FiscalYear? FiscalYear { get; set; }
}
