using System;
using System.Collections.Generic;
using ERPEZ.Application.Common.Interfaces;
using ERPEZ.Application.Features.Procurement.Contracts.Dtos;

namespace ERPEZ.Application.Features.Procurement.NoticeToProceeds.Dtos;

/// <summary>
/// Data DTO passed to NoticeToProceedPdfRenderer for GPPB-compliant document rendering.
/// Captures frozen snapshot data for issued NTPs or live projected data for drafts.
/// </summary>
public class NoticeToProceedDataDto : IAgencyLetterheadAware
{
    public Guid Id { get; set; }
    public string NTPNumber { get; set; } = string.Empty;
    public DateTime? NTPDate { get; set; }
    public DateTime? EffectivityDate { get; set; }
    public DateTime? CommencementDate { get; set; }
    public int? ImplementationPeriodDays { get; set; }
    public DateTime? DeliveryCompletionDeadline { get; set; }
    public string? PlaceOfDelivery { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;

    // Procuring Entity Information
    public string? ProcuringEntityName { get; set; }
    public string? ProcuringEntityOffice { get; set; }
    public string? ProcuringEntityAddress { get; set; }
    public byte[]? LogoBytes { get; set; }
    public string? LetterheadAlignment { get; set; }

    // Contractor / Winning Bidder Information
    public Guid SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public string SupplierAddress { get; set; } = string.Empty;
    public string ContactPerson { get; set; } = string.Empty;
    public string ContactNumber { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;

    // Project & Contract Reference
    public Guid ContractId { get; set; }
    public string ContractNumber { get; set; } = string.Empty;
    public DateTime? ContractDate { get; set; }
    public Guid ProcurementProjectId { get; set; }
    public string ProjectTitle { get; set; } = string.Empty;
    public string ProjectDescription { get; set; } = string.Empty;
    public string ModeOfProcurement { get; set; } = string.Empty;
    public string NOANumber { get; set; } = string.Empty;
    public DateTime? NOADate { get; set; }

    // Financial Figures
    public decimal ContractPrice { get; set; }
    public string AmountInWords { get; set; } = string.Empty;

    // Signatory (HoPE / Authorized Official)
    public string IssuedByName { get; set; } = "Head of the Procuring Entity";
    public string IssuedByPosition { get; set; } = "Head of the Procuring Entity";
    public DateTime? IssuedAt { get; set; }

    // Contractor Acknowledgment (Conforme per GPPB Resolution No. 03-2025)
    public string? ReceivedByName { get; set; }
    public DateTime? ReceivedAt { get; set; }

    // Line items for reference
    public List<ContractLineItemDataDto> LineItems { get; set; } = [];
}
