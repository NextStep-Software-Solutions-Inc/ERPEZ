using System;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Procurement.NoticeToProceeds.Dtos;

/// <summary>
/// Flat DTO for tabular Notice to Proceed listing.
/// Projections are resolved dynamically through Contract -> NoticeOfAward,
/// falling back to frozen snapshots when the NTP has been officially issued.
/// </summary>
public record NoticeToProceedListDto
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

    // Projected / Snapshot Contract Details
    public string ContractNumber { get; init; } = string.Empty;
    public DateOnly ContractDate { get; init; }
    public Guid SupplierId { get; init; }
    public string SupplierName { get; init; } = string.Empty;
    public Guid ProcurementProjectId { get; init; }
    public string ProjectTitle { get; init; } = string.Empty;
    public decimal TotalAmount { get; init; }

    // Issuance & Receipt Tracking
    public string? IssuedByName { get; init; }
    public DateTime? IssuedAt { get; init; }
    public DateOnly? ReceivedAt { get; init; }
    public string? ReceivedByName { get; init; }
    public DateOnly? ReceivedDate => ReceivedAt;
    public DateOnly? ConformeDate => ReceivedAt;
    public string? ConformeName => ReceivedByName;

    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}
