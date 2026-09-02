using System;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Dtos;

public record NoticeOfAwardListDto
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
    public Guid BACResolutionId { get; init; }
    public string BACResolutionNumber { get; init; } = string.Empty;
    public string PRNumber { get; init; } = string.Empty;
    public string ProjectName { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public NoticeOfAwardSlaStateDto SlaState { get; init; } = new();
}
