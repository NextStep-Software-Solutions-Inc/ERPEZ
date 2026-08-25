using ERPEZ.Domain.Common;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Abstract of Bids (AOB) Header.
/// Used for Alternative Methods of Procurement (Shopping, Small Value Procurement, etc.)
/// and Bidding comparative matrix evaluations per GPPB rules.
/// </summary>
public class AOB : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public string AOBNumber { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Description { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public BidEvaluationCriteria AwardCriterion { get; set; } = BidEvaluationCriteria.LCRB;

    [Sieve(CanFilter = true, CanSort = true)]
    public DateOnly AOBDate { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime OpeningDate { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public StatusEnum Status { get; set; } = StatusEnum.Draft;

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? SubmittedBy { get; set; }

    public DateTime? SubmittedAt { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? ApprovedBy { get; set; }

    public DateTime? ApprovedAt { get; set; }

    public string? SignedDocumentUrl { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Remarks { get; set; }

    // Navigation properties
    public virtual List<AOBRFQMapping> AOBRFQMappings { get; set; } = [];
    public virtual List<AOBAwardedItem> AOBAwardedItems { get; set; } = [];
}

