using System;
using System.Collections.Generic;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Dtos;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Procurement.NoticeToProceeds.Dtos;

/// <summary>
/// Detailed DTO for full Notice to Proceed view.
/// Upstream relations (Supplier, ProcurementProject, BACResolution, Amount, LineItems)
/// are projected from Contract -> NoticeOfAward, with fallback to frozen snapshots when issued.
/// </summary>
public record NoticeToProceedDetailDto
{
    public Guid Id { get; init; }
    public string NTPNumber { get; init; } = string.Empty;
    public Guid ContractId { get; init; }
    public DateOnly NTPDate { get; init; }
    public DateOnly? EffectivityDate { get; init; }
    public DateOnly? CommencementDate { get; init; }
    public int? ImplementationPeriodDays { get; init; }
    public DateOnly? DeliveryCompletionDeadline { get; init; }
    public string? PlaceOfDelivery { get; init; }
    public string? Description { get; init; }
    public NoticeToProceedStatus Status { get; init; }

    // Linked Contract Details
    public string ContractNumber { get; init; } = string.Empty;
    public DateOnly ContractDate { get; init; }
    public DateOnly? ContractApprovedAt { get; init; }
    public string ContractDescription { get; init; } = string.Empty;

    // Linked NOA Details
    public Guid NoticeOfAwardId { get; init; }
    public string NOANumber { get; init; } = string.Empty;
    public DateOnly NOADate { get; init; }

    // Projected / Snapshot Supplier Details
    public Guid SupplierId { get; init; }
    public string SupplierName { get; init; } = string.Empty;
    public string? SupplierAddress { get; init; }
    public string? SupplierContactPerson { get; init; }
    public string? SupplierEmail { get; init; }
    public string? SupplierContactNumber { get; init; }

    // Projected / Snapshot Project Details
    public Guid ProcurementProjectId { get; init; }
    public string ProjectTitle { get; init; } = string.Empty;
    public decimal TotalAmount { get; init; }
    public string ModeOfProcurement { get; init; } = string.Empty;
    public string? BACResolutionNumber { get; init; }

    // Frozen snapshots at official issuance (RA 12009 historical auditability)
    public string? ContractNumberSnapshot { get; init; }
    public DateOnly? ContractApprovedDateSnapshot { get; init; }
    public decimal? AwardedAmountSnapshot { get; init; }
    public string? SupplierNameSnapshot { get; init; }
    public string? SupplierAddressSnapshot { get; init; }
    public string? ProjectTitleSnapshot { get; init; }

    // Line items derived from Project / ConsolidatedPR / APP
    public List<AwardedLineItemDto> LineItems { get; init; } = [];

    // Issuance & Conforme Receipt Metadata
    public Guid? IssuedById { get; init; }
    public string? IssuedByName { get; init; }
    public DateTime? IssuedAt { get; init; }
    public DateOnly? ReceivedAt { get; init; }
    public string? ReceivedByName { get; init; }
    public DateOnly? ReceivedDate => ReceivedAt;
    public DateOnly? ConformeDate => ReceivedAt;
    public string? ConformeName => ReceivedByName;
    public Guid? SignedDocumentFileId { get; init; }
    public string? SignedDocumentFileName { get; init; }

    // PhilGEPS Transparency Compliance
    public DateOnly? PhilGEPSPostedAt { get; init; }
    public string? PhilGEPSReferenceNumber { get; init; }

    // Cancellation Details
    public string? CancellationReason { get; init; }
    public Guid? CancelledById { get; init; }
    public DateTime? CancelledAt { get; init; }

    public DateTime CreatedAt { get; init; }
    public string? CreatedBy { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public string? UpdatedBy { get; init; }
}
