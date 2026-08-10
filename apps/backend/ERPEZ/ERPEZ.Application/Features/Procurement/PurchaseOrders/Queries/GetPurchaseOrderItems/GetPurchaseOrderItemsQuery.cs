using ERPEZ.Application.Features.Procurement.PurchaseOrders.DTOs;
using ERPEZ.Shared.Common;
using MediatR;
using System;

namespace ERPEZ.Application.Features.Procurement.PurchaseOrders.Queries.GetPurchaseOrderItems;

public record GetPurchaseOrderItemsQuery(
    Guid PurchaseOrderId,
    int PageNumber = 1,
    int PageSize = 10,
    string? Filters = null,
    string? Sorts = null
) : IRequest<PaginatedApiResponse<PurchaseOrderItemDto>>;
