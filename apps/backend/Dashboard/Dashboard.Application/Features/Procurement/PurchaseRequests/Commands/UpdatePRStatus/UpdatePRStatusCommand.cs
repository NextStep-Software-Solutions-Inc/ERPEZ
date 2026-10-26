using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.UpdatePRStatus;

public record UpdatePRStatusCommand(Guid Id, StatusEnum Status, string? Remarks = null, string? ActorName = null) : IRequest<ApiResponse<Unit>>;