using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseOrders.Commands.SubmitPurchaseOrderForApproval;

public record SubmitPurchaseOrderForApprovalCommand(Guid Id) : IRequest<ApiResponse<bool>>;
