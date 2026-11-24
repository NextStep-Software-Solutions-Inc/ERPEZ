using ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.UpdatePR;

public record UpdatePRCommand(Guid Id, UpdatePRRequest Dto) : IRequest<ApiResponse<Unit>>;