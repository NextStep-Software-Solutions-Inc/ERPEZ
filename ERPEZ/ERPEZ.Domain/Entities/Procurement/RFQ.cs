using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;

// NOTE: Uses the project-wide shared StatusEnum (Draft, Submitted, Returned, Approved, ...),
// not a module-specific enum. RFQ only ever writes Draft/Submitted/Approved/Returned to Status.
// "Submitted" is rendered as "For Approval" on the BAC Chair's UI — StatusEnum.ForApproval
// itself is not used by RFQ (it belongs to other modules' workflows).

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Request for Quotation header. Used for Alternative Methods of Procurement
/// (Shopping, Small Value Procurement, Negotiated Procurement, Direct Contracting, etc.)
/// per GPPB rules.
/// </summary>
public class RFQ : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public string RFQNumber { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string TracingNumber { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Description { get; set; }

    /// <summary>
    /// Locked from the first RFQItem's ConsolidatedPRItem.ProcurementModeId on first add.
    /// All items added to a single RFQ must share the same procurement mode.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? ModeOfProcurementId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateOnly Date { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateOnly? Deadline { get; set; }

    /// <summary>Free text, e.g. "7 days after award" — matches UI placeholder, not a fixed int.</summary>
    public string? DeliveryPeriod { get; set; }

    public string? Purpose { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public StatusEnum Status { get; set; } = StatusEnum.Draft;

    /// <summary>Computed as SUM(RFQItem.Quantity * RFQItem.UnitPriceSnapshot); stored for report stability.</summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal TotalAmount { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Remarks { get; set; }

    // Navigation
    public virtual ProcurementMode? ModeOfProcurement { get; set; }
    public virtual List<RFQItem> RFQItems { get; set; } = [];
    public virtual List<RFQSupplier> RFQSuppliers { get; set; } = [];
}
