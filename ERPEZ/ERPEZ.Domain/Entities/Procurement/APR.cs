using ERPEZ.Domain.Common;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Agency Procurement Request (APR)
/// Created from an approved APP — a subset (or all) of its APPItems are pulled in,
/// snapshotting Qty/UnitCost/TotalCost at time of selection (see APRItem).
/// TotalAmount is calculated as the sum of APRItems.TotalCost and validated against
/// APP's approved budget ceiling at creation time (not re-validated live).
/// </summary>
public class APR : ApprovableEntity
{
    public APR() { }

    [Sieve(CanFilter = true, CanSort = true)]
    public string APRNumber { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid APPId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid OfficeId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid FiscalYearId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal TotalAmount { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? AgencyControlNumber { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? AgencyAccountCode { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateOnly RequestDate { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Description { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public APRModeOfDelivery ModeOfDelivery { get; set; } = APRModeOfDelivery.FastLane;

    [Sieve(CanFilter = true, CanSort = true)]
    public APRInsufficientFundsAction InsufficientFundsAction { get; set; } = APRInsufficientFundsAction.ReduceQuantity;

    [Sieve(CanFilter = true, CanSort = true)]
    public bool RequiresObR { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public bool RequiresCBA { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public bool RequiresCompleteSpecifications { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? AdditionalRemarks { get; set; }

    // Navigation properties
    public virtual APP APP { get; set; } = null!;
    public virtual Office? Office { get; set; }
    public virtual FiscalYear? FiscalYear { get; set; }
    public virtual List<APRItem> APRItems { get; set; } = [];

    // Inherited from ApprovableEntity:
    // public string Status { get; set; }
    // public DateTime? SubmittedDate { get; set; }
    // public DateTime? ApprovedDate { get; set; }
}
