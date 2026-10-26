using ERPEZ.Shared.Common;
using ERPEZ.Application.Features.Procurement.PurchaseOrders.DTOs;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseOrders.Queries.GetPurchaseOrders;

public record GetPurchaseOrdersQuery(
    int PageNumber = 1,
    int PageSize = 10,
    string? Filters = null,
    string? Sorts = null,
    string? Search = null
) : IRequest<PaginatedApiResponse<PurchaseOrderListItemDto>>;
