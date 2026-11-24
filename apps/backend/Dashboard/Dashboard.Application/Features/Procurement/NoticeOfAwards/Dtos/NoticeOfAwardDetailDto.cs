using System;
using System.Collections.Generic;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Dtos;

public record NoticeOfAwardDetailDto
{
    public Guid Id { get; init; }
    public string NOANumber { get; init; } = string.Empty;
    public DateOnly Date { get; init; }
    public DateOnly DateBid { get; init; }
    public string Description { get; init; } = string.Empty;
    public NoticeOfAwardType Type { get; init; }
    public NoticeOfAwardStatus Status { get; init; }
    public decimal TotalAmount { get; init; }
    public Guid SupplierId { get; init; }
    public string SupplierName { get; init; } = string.Empty;
    public string AwardCriterion { get; init; } = "LCRB";
    public decimal AwardedAmount { get; init; }

    public Guid BACResolutionId { get; init; }
    public string BACResolutionNumber { get; init; } = string.Empty;
    public DateOnly BACResolutionDate { get; init; }
    public string BACResolutionDescription { get; init; } = string.Empty;
    public string? SourceAOBNumber { get; init; }

    public Guid ProcurementProjectId { get; init; }
    public string ProjectName { get; init; } = string.Empty;
    public string ProjectDescription { get; init; } = string.Empty;
    public string PRNumber { get; init; } = string.Empty;
    public string EndUser { get; init; } = string.Empty;
    public string ModeOfProcurement { get; init; } = "Public Bidding";
    public decimal ApprovedBudget { get; init; }

    public Guid? ApprovedById { get; init; }
    public string? ApprovedByName { get; init; }
    public DateTime? ApprovedAt { get; init; }
    public DateTime? IssuedAt { get; init; }
    public DateOnly? ReceivedAt { get; init; }
    public Guid? SignedDocumentFileId { get; init; }
    public string? SignedDocumentFileName { get; init; }
    public DateOnly? PhilGEPSPostedAt { get; init; }
    public string? PhilGEPSReferenceNumber { get; init; }
    public string? ReturnReason { get; init; }

    public DateOnly? ContractExecutionDeadline { get; init; }
    public string? ContractExecutionJustification { get; init; }
    public DateTime? JustificationLoggedAt { get; init; }
    public DateTime? CascadeTriggeredAt { get; init; }
    public string? CascadeTriggeredByName { get; init; }
    public string? CascadeNote { get; init; }
    public NoticeOfAwardSlaStateDto SlaState { get; init; } = new();

    public List<AwardedLineItemDto> LineItems { get; init; } = [];
    public List<NoticeOfAwardMilestoneDto> Milestones { get; init; } = [];
    public List<NoticeOfAwardActivityDto> ActivityLog { get; init; } = [];

    public DateOnly? ConformeReceivedDate { get; init; }
    public string? ConformeFileName { get; init; }
    public Guid? ConformeFileId { get; init; }
    public DateOnly? PerformanceSecurityPostedDate { get; init; }
    public string? PerformanceSecurityFileName { get; init; }
    public Guid? PerformanceSecurityFileId { get; init; }
    public DateOnly? ContractExecutionDate { get; init; }
    public string? ContractFileName { get; init; }
    public Guid? ContractFileId { get; init; }

    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}
