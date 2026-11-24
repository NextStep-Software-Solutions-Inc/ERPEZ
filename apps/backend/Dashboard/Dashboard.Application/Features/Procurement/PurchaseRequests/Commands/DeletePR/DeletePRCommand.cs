using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.DeletePR;

public record DeletePRCommand(Guid Id) : IRequest<ApiResponse<Unit>>;