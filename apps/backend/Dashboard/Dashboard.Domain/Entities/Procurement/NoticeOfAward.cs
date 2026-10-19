using System;
using System.Collections.Generic;
using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Notice of Award (NOA) Header.
/// Represents the formal notice issued to the winning bidder following BAC resolution approval.
/// </summary>
public class NoticeOfAward : TenantScopedEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public string NOANumber { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid BACResolutionId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ProcurementProjectId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid SupplierId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateOnly NOADate { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateOnly BidDate { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string Description { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public NoticeOfAwardType ProcurementType { get; set; } = NoticeOfAwardType.GoodsAndServices;

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal AwardedAmount { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string AwardCriterion { get; set; } = "LCRB";

    [Sieve(CanFilter = true, CanSort = true)]
    public NoticeOfAwardStatus Status { get; set; } = NoticeOfAwardStatus.Draft;

    [Sieve(CanFilter = true, CanSort = true)]
    public string? ReturnReason { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? SubmittedById { get; set; }
    public DateTime? SubmittedAt { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? ApprovedById { get; set; }
    public string? ApprovedByName { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public DateTime? IssuedAt { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateOnly? ReceivedAt { get; set; }

    public Guid? SignedDocumentFileId { get; set; }
    public string? SignedDocumentFileName { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateOnly? PhilGEPSPostedAt { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public string? PhilGEPSReferenceNumber { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateOnly? ContractExecutionDeadline { get; set; }
    public string? ContractExecutionJustification { get; set; }
    public DateTime? JustificationLoggedAt { get; set; }

    public DateTime? CascadeTriggeredAt { get; set; }
    public Guid? CascadeTriggeredById { get; set; }
    public string? CascadeTriggeredByName { get; set; }
    public string? CascadeNote { get; set; }

    // Navigation properties
    public virtual BACResolution BACResolution { get; set; } = null!;
    public virtual ProcurementProject ProcurementProject { get; set; } = null!;
    public virtual Supplier Supplier { get; set; } = null!;
    public virtual List<NoticeOfAwardMilestone> Milestones { get; set; } = [];
    public virtual List<NoticeOfAwardActivity> Activities { get; set; } = [];
}
