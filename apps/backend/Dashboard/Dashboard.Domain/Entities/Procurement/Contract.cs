using System;
using ERPEZ.Domain.Common;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Represents a formal bilateral contract agreement under RA 12009 Section 66.
/// Sourced exclusively from an approved Notice of Award.
/// Winning Supplier, Procurement Project, and Total Amount are normalized and derived authoritatively through NoticeOfAward.
/// </summary>
public class Contract : TenantScopedEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public string ContractNumber { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid NoticeOfAwardId { get; set; }

    /// <summary>
    /// Date appearing on the formal contract instrument itself.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public DateOnly ContractDate { get; set; }

    public string Description { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public ContractStatus Status { get; set; } = ContractStatus.Draft;

    // Internal Agency Approval Tracking
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? SubmittedById { get; set; }
    public DateTime? SubmittedAt { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? ApprovedById { get; set; }
    public string? ApprovedByName { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? ApprovalRemarks { get; set; }

    public string? ReturnRemarks { get; set; }
    public Guid? ReturnedById { get; set; }
    public DateTime? ReturnedAt { get; set; }

    // Bilateral Execution Metadata (RA 12009 Sec. 66)
    [Sieve(CanFilter = true, CanSort = true)]
    public DateOnly? ExecutedAt { get; set; }
    public Guid? ExecutedById { get; set; }
    public string? ExecutedByName { get; set; }

    /// <summary>
    /// Date of statutory contract approval by the appropriate authority (RA 12009 Sec. 65/66),
    /// which legally triggers the 3-calendar-day Notice to Proceed (NTP) window.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public DateOnly? ContractApprovedAt { get; set; }

    public Guid? SignedContractFileId { get; set; }
    public string? SignedContractFileName { get; set; }

    /// <summary>
    /// Audit disclosure recorded when bilateral execution occurs after the statutory
    /// 10-calendar-day window (RA 12009 Sec. 66). Captures administrative justification
    /// for COA/BAC oversight without declaring legal sufficiency.
    /// </summary>
    public string? LateExecutionJustification { get; set; }
    public DateTime? JustificationLoggedAt { get; set; }

    // Navigation Property
    public virtual NoticeOfAward NoticeOfAward { get; set; } = null!;
}
