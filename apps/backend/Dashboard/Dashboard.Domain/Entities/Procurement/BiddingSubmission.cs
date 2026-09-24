using System;
using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Planning;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Represents a supplier's submitted bid proposal for a Public Bidding procurement project.
/// Preserves the immutable original submission data as submitted before the deadline.
/// </summary>
public class BiddingSubmission : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ProcurementProjectId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid SupplierId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? PublicSupplierApplicationId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal OriginalProposedAmount { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string BidSecurityType { get; set; } = string.Empty; // "Bid Securing Declaration", "Bank Guarantee", "Surety Bond"

    public decimal? BidSecurityAmount { get; set; }
    public string? BidSecurityNumber { get; set; }
    public int? BidSecurityValidityDays { get; set; }
    public string SubmissionType { get; set; } = "Electronic"; // "Electronic" | "Physical"

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime SubmittedAt { get; set; }

    public string? Remarks { get; set; }

    // Navigation properties
    public virtual ProcurementProject ProcurementProject { get; set; } = null!;
    public virtual Supplier Supplier { get; set; } = null!;
    public virtual PublicSupplierApplication? PublicSupplierApplication { get; set; }
    public virtual BidOpeningRecord? BidOpeningRecord { get; set; }
    public virtual List<BiddingSubmissionItem> BiddingSubmissionItems { get; set; } = [];
}
