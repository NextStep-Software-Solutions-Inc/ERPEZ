using ERPEZ.Shared.Common;
using ERPEZ.Application.Features.Procurement.PurchaseOrders.DTOs;
using MediatR;
using System;

namespace ERPEZ.Application.Features.Procurement.PurchaseOrders.Queries.GetPurchaseOrderById;

public record GetPurchaseOrderByIdQuery(Guid Id) : IRequest<ApiResponse<PurchaseOrderDto>>;
