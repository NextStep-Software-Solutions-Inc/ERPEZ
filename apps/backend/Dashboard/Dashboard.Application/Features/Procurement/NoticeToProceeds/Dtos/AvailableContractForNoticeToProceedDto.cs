using System;
using System.Collections.Generic;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Dtos;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Procurement.NoticeToProceeds.Dtos;

/// <summary>
/// DTO representing an Approved/Executed Contract eligible for Notice to Proceed creation
/// (i.e. has no active NTP record).
/// </summary>
public record AvailableContractForNoticeToProceedDto
{
    public Guid Id { get; init; }
    public string ContractNumber { get; init; } = string.Empty;
    public DateOnly ContractDate { get; init; }
    public DateOnly? ContractApprovedAt { get; init; }
    public ContractStatus Status { get; init; }
    public Guid NoticeOfAwardId { get; init; }
    public string NOANumber { get; init; } = string.Empty;
    public Guid SupplierId { get; init; }
    public string SupplierName { get; init; } = string.Empty;
    public Guid ProcurementProjectId { get; init; }
    public string ProjectTitle { get; init; } = string.Empty;
    public decimal TotalAmount { get; init; }
    public string ModeOfProcurement { get; init; } = string.Empty;
    public List<AwardedLineItemDto> LineItems { get; init; } = [];
}
