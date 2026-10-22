using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseOrders.Commands.ReturnPurchaseOrder;

public record ReturnPurchaseOrderCommand(Guid Id, string ReturnReason) : IRequest<ApiResponse<bool>>;
