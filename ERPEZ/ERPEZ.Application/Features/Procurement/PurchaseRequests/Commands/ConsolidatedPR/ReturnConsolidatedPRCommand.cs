using ERPEZ.Shared.Common;
using ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.ConsolidatedPR;

public record ReturnConsolidatedPRCommand(Guid Id, ReturnConsolidatedPRRequest Dto) : IRequest<ApiResponse<Unit>>;