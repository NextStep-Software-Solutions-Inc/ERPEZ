using System;
using ERPEZ.Domain.Common;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Notice to Proceed (NTP) under RA 12009 Section 66 and GPPB Resolution No. 03-2025.
/// Sourced authoritatively from an approved/executed bilateral Contract agreement.
/// Authorizes the winning contractor/supplier to commence performance/delivery.
/// Upstream procurement details (Supplier, ProcurementProject, BACResolution, Amount)
/// are normalized through Contract -> NoticeOfAward, with immutable snapshots frozen upon issuance.
/// </summary>
public class NoticeToProceed : TenantScopedEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public string NTPNumber { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ContractId { get; set; }

    /// <summary>
    /// Date of the Notice to Proceed instrument itself.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public DateOnly NTPDate { get; set; }

    /// <summary>
    /// Date when contract effectivity starts (RA 12009 Sec. 66: effective upon receipt of NTP or date specified).
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public DateOnly? EffectivityDate { get; set; }

    /// <summary>
    /// Date contractor must commence work/delivery (defaults to within 7 calendar days from receipt unless stated).
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public DateOnly? CommencementDate { get; set; }

    /// <summary>
    /// Contract duration / delivery period in calendar days.
    /// </summary>
    public int? ImplementationPeriodDays { get; set; }

    /// <summary>
    /// Final calculated or designated deadline for completion/delivery.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public DateOnly? DeliveryCompletionDeadline { get; set; }

    public string? PlaceOfDelivery { get; set; }

    public string? Description { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public NoticeToProceedStatus Status { get; set; } = NoticeToProceedStatus.Draft;

    // Snapshot fields frozen at issuance for audit immutability (COA / PhilGEPS / historical integrity)
    public string? ContractNumberSnapshot { get; set; }
    public DateOnly? ContractApprovedDateSnapshot { get; set; }
    public decimal AwardedAmountSnapshot { get; set; }
    public string? SupplierNameSnapshot { get; set; }
    public string? SupplierAddressSnapshot { get; set; }
    public string? ProjectTitleSnapshot { get; set; }

    // Issuance Metadata
    public Guid? IssuedById { get; set; }
    public string? IssuedByName { get; set; }
    public DateTime? IssuedAt { get; set; }

    // Contractor Conforme / Acknowledgment of Receipt (GPPB Resolution No. 03-2025 Standard Form)
    [Sieve(CanFilter = true, CanSort = true)]
    public DateOnly? ReceivedAt { get; set; }
    public string? ReceivedByName { get; set; }

    public Guid? SignedDocumentFileId { get; set; }
    public string? SignedDocumentFileName { get; set; }

    // PhilGEPS Transparency Compliance (RA 12009 Sec. 66)
    [Sieve(CanFilter = true, CanSort = true)]
    public DateOnly? PhilGEPSPostedAt { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public string? PhilGEPSReferenceNumber { get; set; }

    // Administrative Cancellation / Return Audit
    public string? CancellationReason { get; set; }
    public Guid? CancelledById { get; set; }
    public DateTime? CancelledAt { get; set; }

    // Navigation Property
    public virtual Contract Contract { get; set; } = null!;
}
