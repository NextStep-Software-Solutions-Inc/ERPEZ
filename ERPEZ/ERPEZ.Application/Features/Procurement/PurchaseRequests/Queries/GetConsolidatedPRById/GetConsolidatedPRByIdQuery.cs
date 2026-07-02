using ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Queries.GetConsolidatedPRById;

public record GetConsolidatedPRByIdQuery(Guid Id) : IRequest<ApiResponse<ConsolidatedPRDetailResponse>>;