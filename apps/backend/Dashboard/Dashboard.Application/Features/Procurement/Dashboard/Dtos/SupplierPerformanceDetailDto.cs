using System;
using System.Collections.Generic;

namespace ERPEZ.Application.Features.Procurement.Dashboard.Dtos;

public record SupplierDeliveryItemDto
{
    public Guid ContractId { get; init; }
    public string ContractNumber { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public decimal Amount { get; init; }
    public string Status { get; init; } = string.Empty;
    public DateTime? CompletionDate { get; init; }
    public bool WasDelayed { get; init; }
    public int DelayDays { get; init; }
}

public record SupplierPerformanceDetailDto
{
    public Guid SupplierId { get; init; }
    public string SupplierName { get; init; } = string.Empty;
    public string BusinessPermitNo { get; init; } = string.Empty;
    public string? PhilGEPSNumber { get; init; }
    public bool IsBlocked { get; init; }
    public bool IsGppbBlacklisted { get; init; }
    public double OnTimeDeliveryRate { get; init; }
    public double QualityAcceptanceRate { get; init; }
    public int TotalContractsAwarded { get; init; }
    public decimal TotalAwardedAmount { get; init; }
    public int LiquidatedDamagesIncidentsCount { get; init; }
    public decimal TotalLiquidatedDamagesAmount { get; init; }
    public List<SupplierDeliveryItemDto> RecentDeliveries { get; init; } = [];
}
