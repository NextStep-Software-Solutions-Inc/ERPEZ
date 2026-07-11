using ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.ConsolidatedPR;

public record AddPRsToConsolidatedCommand(Guid ConsolidatedPRId, AddPRsToConsolidatedRequest Dto)
    : IRequest<ApiResponse<Unit>>;