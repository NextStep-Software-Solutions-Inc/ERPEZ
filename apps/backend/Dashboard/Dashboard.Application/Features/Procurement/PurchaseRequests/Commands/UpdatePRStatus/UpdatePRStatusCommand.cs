using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.UpdatePRStatus;

public record UpdatePRStatusCommand(Guid Id, StatusEnum Status) : IRequest<ApiResponse<Unit>>;