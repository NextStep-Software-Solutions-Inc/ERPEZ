using System;
using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Planning;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Aggregate root representing the authoritative winning award recommendation resulting from completed Post-Qualification.
/// Consumed directly by BACResolution (Award) and NoticeOfAward (NOA).
/// </summary>
public class BiddingAwardRecommendation : TenantScopedEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ProcurementProjectId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid WinningSupplierId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid BiddingPostQualificationId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal AwardedAmount { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string AwardCriterion { get; set; } = "LCRB"; // "LCRB" | "MEARB"

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime RecommendedAt { get; set; }

    // Audit identity conventions
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? RecommendedById { get; set; }
    public string? RecommendedByName { get; set; }

    public string? Remarks { get; set; }

    // Navigation properties
    public virtual ProcurementProject ProcurementProject { get; set; } = null!;
    public virtual Supplier WinningSupplier { get; set; } = null!;
    public virtual BiddingPostQualification BiddingPostQualification { get; set; } = null!;
    public virtual BACResolution? BACResolution { get; set; }
}
