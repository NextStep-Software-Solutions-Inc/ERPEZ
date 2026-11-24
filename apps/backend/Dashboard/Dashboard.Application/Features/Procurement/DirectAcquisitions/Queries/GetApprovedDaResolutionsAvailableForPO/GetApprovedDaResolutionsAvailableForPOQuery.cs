using System;
using System.Collections.Generic;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.DirectAcquisitions.Queries.GetApprovedDaResolutionsAvailableForPO;

public record GetApprovedDaResolutionsAvailableForPOQuery : IRequest<ApiResponse<List<AvailableDaResolutionDto>>>;

public class AvailableDaResolutionDto
{
    public Guid Id { get; set; }
    public string DANumber { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string CPRNumber { get; set; } = string.Empty;
    public string? BACResolutionNumber { get; set; }
    public decimal TotalABC { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<AvailableDaItemDto> ConsolidatedPRItems { get; set; } = [];
}

public class AvailableDaItemDto
{
    public Guid Id { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public string? ItemDescription { get; set; }
    public int Quantity { get; set; }
    public string Unit { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public decimal TotalAmount { get; set; }
    public string? Fund { get; set; }
    public string? Office { get; set; }
}
