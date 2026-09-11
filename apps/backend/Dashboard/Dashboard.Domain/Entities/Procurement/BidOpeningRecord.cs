using System;
using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Represents the BAC's official opening record and observation during the scheduled Opening of Bids session.
/// Belongs to the BiddingSubmission aggregate.
/// </summary>
public class BidOpeningRecord : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid BiddingSubmissionId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid BiddingActivityScheduleId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string Envelope1Result { get; set; } = "Pending"; // "Passed" | "Failed"

    [Sieve(CanFilter = true, CanSort = true)]
    public bool Envelope2Opened { get; set; } = false;

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal? AsReadBidAmount { get; set; } // Null if Envelope 1 Failed

    public string? DisqualificationReason { get; set; }
    public string? Remarks { get; set; }

    // Audit identity conventions
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? OpenedById { get; set; }
    public string? OpenedByName { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime OpenedAt { get; set; }

    // Navigation properties
    public virtual BiddingSubmission BiddingSubmission { get; set; } = null!;
    public virtual BiddingActivitySchedule BiddingActivitySchedule { get; set; } = null!;
    public virtual BiddingEvaluatedBid? BiddingEvaluatedBid { get; set; }
}
