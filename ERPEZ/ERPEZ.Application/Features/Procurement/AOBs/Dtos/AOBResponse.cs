using System;
using System.Collections.Generic;

namespace ERPEZ.Application.Features.Procurement.AOBs.Dtos;

public record AOBResponse
{
    public Guid Id { get; init; }
    public string AOBNumber { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string AwardCriterion { get; init; } = string.Empty;
    public DateOnly AOBDate { get; init; }
    public DateTime OpeningDate { get; init; }
    public string Status { get; set; } = string.Empty;
    public List<Guid> ProcurementProjectIds { get; init; } = [];
    public List<AOBAwardedItemResponse> AwardedItems { get; init; } = [];
}

public record AOBDetailResponse
{
    public Guid Id { get; init; }
    public string AOBNumber { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string AwardCriterion { get; init; } = string.Empty;
    public DateOnly AOBDate { get; init; }
    public DateTime OpeningDate { get; init; }
    public string Status { get; set; } = string.Empty;
    public List<AOBProjectDetailResponse> ProcurementProjects { get; init; } = [];
    public List<AOBAwardedItemResponse> AwardedItems { get; init; } = [];
}

public record AOBProjectDetailResponse
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public decimal ABC { get; init; }
    public string Status { get; init; } = string.Empty;
}

public record AOBAwardedItemResponse
{
    public Guid Id { get; init; }
    public Guid APPItemId { get; init; }
    public string APPItemName { get; init; } = string.Empty;
    public Guid WinningSupplierId { get; init; }
    public string WinningSupplierName { get; init; } = string.Empty;
    public decimal AwardedUnitPrice { get; init; }
    public decimal Score { get; init; }
}
