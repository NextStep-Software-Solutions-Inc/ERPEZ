using System;
using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Planning;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Child entity of BiddingEvaluation representing a single evaluated bid from a supplier.
/// Maintains distinct EvaluatedBidPrice after arithmetic correction and scoring/ranking.
/// </summary>
public class BiddingEvaluatedBid : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid BiddingEvaluationId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid BidOpeningRecordId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid SupplierId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal EvaluatedBidPrice { get; set; }

    public decimal? TechnicalScore { get; set; }
    public decimal? NormalizedFinancialScore { get; set; }
    public decimal? TotalScore { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public int Rank { get; set; }

    // Workflow status (Strictly separate from AwardCriterion)
    [Sieve(CanFilter = true, CanSort = true)]
    public string Status { get; set; } = "Ranked"; // "Ranked" | "Under_PostQual" | "Passed_PostQual" | "Disqualified"

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsResponsive { get; set; } = true;

    public string? NonResponsiveReason { get; set; }

    // Navigation properties
    public virtual BiddingEvaluation BiddingEvaluation { get; set; } = null!;
    public virtual BidOpeningRecord BidOpeningRecord { get; set; } = null!;
    public virtual Supplier Supplier { get; set; } = null!;
    public virtual BiddingPostQualification? PostQualification { get; set; }
}
