using System;
using System.Collections.Generic;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Dtos;

namespace ERPEZ.Application.Features.Procurement.Contracts.Dtos;

/// <summary>
/// DTO representing an Approved Notice of Award that has no active contract,
/// available for linking in the Create Contract modal.
/// </summary>
public record AvailableNoaForContractDto
{
    public Guid Id { get; init; }
    public string NOANumber { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public Guid SupplierId { get; init; }
    public string SupplierName { get; init; } = string.Empty;
    public Guid ProcurementProjectId { get; init; }
    public string ProjectTitle { get; init; } = string.Empty;
    public decimal TotalAmount { get; init; }
    public DateOnly NOADate { get; init; }
    public string ModeOfProcurement { get; init; } = string.Empty;
    public List<AwardedLineItemDto> LineItems { get; init; } = [];
}
