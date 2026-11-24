using ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Queries.GetPRById;

public record GetPRByIdQuery(Guid Id) : IRequest<ApiResponse<PurchaseRequestDetailResponse>>;