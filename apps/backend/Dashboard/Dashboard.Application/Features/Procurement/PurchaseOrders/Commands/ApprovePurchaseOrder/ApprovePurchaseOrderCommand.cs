using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseOrders.Commands.ApprovePurchaseOrder;

public record ApprovePurchaseOrderCommand(Guid Id) : IRequest<ApiResponse<bool>>;
