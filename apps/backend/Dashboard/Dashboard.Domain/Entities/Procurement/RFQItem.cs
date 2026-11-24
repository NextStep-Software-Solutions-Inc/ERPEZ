using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// A line item sourced from an approved ConsolidatedPRItem into an RFQ.
/// Carries snapshot fields (denormalized at add-time) for report stability and
/// to avoid trusting live joins through PRItem/PPMPItem/PurchaseRequest at read time —
/// mirrors the snapshot convention used on APRItem / RFQItem in this codebase.
/// </summary>
public class RFQItem : TenantScopedEntity
{
    public RFQItem() { }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid RFQId { get; set; }

    /// <summary>References ConsolidatedPRItem.Id — the sourced budget line.</summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid CPRItemId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public int Quantity { get; set; }

    /// <summary>Snapshot of PRItem.UnitCost at the time this item was added to the RFQ.</summary>
    public decimal UnitPriceSnapshot { get; set; }

    /// <summary>Snapshot of PRItem.Name at the time this item was added to the RFQ.</summary>
    public string ItemNameSnapshot { get; set; } = string.Empty;

    /// <summary>
    /// Snapshot of PurchaseRequest.ProcurementCategory.Name (preferred), falling back to
    /// PRItem.PPMPItem.ProcurementMode.ProcurementCategory.Name when the PR-level category is null.
    /// </summary>
    public string? CategorySnapshot { get; set; }

    /// <summary>Snapshot of PurchaseRequest.FundSource.Name at the time this item was added.</summary>
    public string? FundSnapshot { get; set; }

    public bool IsBrochureRequired { get; set; }

    /// <summary>Optional free-text environmental/eco-friendly requirement. No controlled vocabulary.</summary>
    public string? GreenSpecification { get; set; }

    // Navigation
    public virtual RFQ RFQ { get; set; } = null!;
    public virtual ConsolidatedPRItem CPRItem { get; set; } = null!;
}
