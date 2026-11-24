using ERPEZ.Shared.Common;
using MediatR;
using System;

namespace ERPEZ.Application.Features.Procurement.PurchaseOrders.Commands.DeletePurchaseOrder;

public record DeletePurchaseOrderCommand(Guid Id) : IRequest<ApiResponse<bool>>;
