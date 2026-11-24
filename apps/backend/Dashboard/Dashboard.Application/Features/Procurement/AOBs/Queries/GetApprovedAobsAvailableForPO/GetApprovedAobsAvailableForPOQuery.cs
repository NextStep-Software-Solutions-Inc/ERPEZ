using System;
using System.Collections.Generic;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.AOBs.Queries.GetApprovedAobsAvailableForPO;

public record GetApprovedAobsAvailableForPOQuery : IRequest<ApiResponse<List<AvailableAobDto>>>;

public class AvailableAobDto
{
    public Guid Id { get; set; }
    public string AOBNumber { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid WinningSupplierId { get; set; }
    public string WinningSupplierName { get; set; } = string.Empty;
    public decimal TotalAwardedAmount { get; set; }
    public DateOnly AOBDate { get; set; }
    public List<AvailableAobItemDto> AwardedItems { get; set; } = [];
}

public class AvailableAobItemDto
{
    public Guid Id { get; set; }
    public Guid RFQItemId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string Unit { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public decimal TotalAmount { get; set; }
}
