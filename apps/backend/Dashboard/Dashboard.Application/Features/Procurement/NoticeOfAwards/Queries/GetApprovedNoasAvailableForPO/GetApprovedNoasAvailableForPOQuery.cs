using System;
using System.Collections.Generic;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Queries.GetApprovedNoasAvailableForPO;

public record GetApprovedNoasAvailableForPOQuery : IRequest<ApiResponse<List<AvailableNoaDto>>>;

public class AvailableNoaDto
{
    public Guid Id { get; set; }
    public string NOANumber { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public DateOnly NOADate { get; set; }
    public List<AvailableNoaItemDto> LineItems { get; set; } = [];
}

public class AvailableNoaItemDto
{
    public string Id { get; set; } = string.Empty;
    public string ItemName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string Unit { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public decimal Amount { get; set; }
}
