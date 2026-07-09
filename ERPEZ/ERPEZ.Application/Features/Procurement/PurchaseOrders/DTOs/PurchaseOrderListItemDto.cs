using ERPEZ.Domain.Enums;
using System;

namespace ERPEZ.Application.Features.Procurement.PurchaseOrders.DTOs;

public class PurchaseOrderListItemDto
{
    public Guid Id { get; set; }
    public string PONumber { get; set; } = string.Empty;
    public string? Description { get; set; }
    public StatusEnum Status { get; set; }
    public DateOnly Date { get; set; }
    public decimal TotalAmount { get; set; }
}
