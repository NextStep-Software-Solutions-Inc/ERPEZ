using ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Queries.GetEligiblePRsForCPR;

public record GetEligiblePRsForCPRQuery(Guid ConsolidatedPRId)
    : IRequest<ApiResponse<List<EligiblePRResponse>>>;