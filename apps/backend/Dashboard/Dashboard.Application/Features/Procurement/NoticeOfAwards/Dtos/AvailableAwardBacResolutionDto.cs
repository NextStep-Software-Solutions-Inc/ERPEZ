using System;
using System.Collections.Generic;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Dtos;

public record AvailableAwardBacResolutionDto
{
    public Guid Id { get; init; }
    public string BACResolutionNumber { get; init; } = string.Empty;
    public DateOnly ResolutionDate { get; init; }
    public string Description { get; init; } = string.Empty;
    public Guid ProcurementProjectId { get; init; }
    public string ProjectName { get; init; } = string.Empty;
    public string ProjectDescription { get; init; } = string.Empty;
    public string PRNumber { get; init; } = string.Empty;
    public string EndUser { get; init; } = string.Empty;
    public decimal ApprovedBudget { get; init; }
    public string ModeOfProcurement { get; init; } = "Public Bidding";
    public Guid SupplierId { get; init; }
    public string WinningSupplierName { get; init; } = string.Empty;
    public decimal AwardedAmount { get; init; }
    public string AwardCriterion { get; init; } = "LCRB";
    public string? SourceAOBNumber { get; init; }
    public List<AwardedLineItemDto> LineItems { get; init; } = [];
}
