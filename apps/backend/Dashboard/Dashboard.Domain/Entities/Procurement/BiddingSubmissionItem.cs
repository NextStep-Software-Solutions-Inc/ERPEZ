using System;
using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Represents a supplier's submitted line-item financial offer for an itemized Public Bidding project
/// (such as a Goods Price Schedule or Infrastructure Bill of Quantities).
/// Keeps authoritative project item specifications (ABC, description, project quantity) separate from the supplier's offer.
/// </summary>
public class BiddingSubmissionItem : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid BiddingSubmissionId { get; set; }

    /// <summary>
    /// References the authoritative procurement project item (e.g. ConsolidatedPRItem.Id or project line item).
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ProcurementProjectItemId { get; set; }

    /// <summary>
    /// Quantity quoted by the bidder (validated to match authoritative project item quantity).
    /// </summary>
    public decimal Quantity { get; set; }

    public string Uom { get; set; } = string.Empty;

    /// <summary>
    /// Bidder's offered unit price.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal UnitPrice { get; set; }

    /// <summary>
    /// Line total: UnitPrice * Quantity.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal TotalPrice { get; set; }

    /// <summary>
    /// Offered brand for Goods procurement (optional).
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public string? Brand { get; set; }

    /// <summary>
    /// Offered model for Goods procurement (optional).
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public string? Model { get; set; }

    // Navigation property
    public virtual BiddingSubmission BiddingSubmission { get; set; } = null!;
}
