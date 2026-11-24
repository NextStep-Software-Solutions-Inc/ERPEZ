using System;
using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Child entity of BiddingEvaluatedBid representing the post-qualification verification for that specific ranked bidder.
/// Independently auditable for each ranked bidder (failed rank #1 does not mutate; next rank gets a distinct record).
/// </summary>
public class BiddingPostQualification : TenantScopedEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid BiddingEvaluatedBidId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime? PostQualificationNoticeSentAt { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime? DocsReceivedDate { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime? TargetDeadlineDate { get; set; }

    public bool? Passed { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string Status { get; set; } = "PendingDocs"; // "PendingDocs" | "UnderEvaluation" | "Passed" | "Disqualified"

    public string? Findings { get; set; }

    // Audit identity conventions
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? VerifiedById { get; set; }
    public string? VerifiedByName { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime? CompletedAt { get; set; }

    // Navigation properties
    public virtual BiddingEvaluatedBid BiddingEvaluatedBid { get; set; } = null!;
    public virtual BiddingAwardRecommendation? AwardRecommendation { get; set; }
}
