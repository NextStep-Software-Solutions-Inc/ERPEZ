using ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Queries.GetEligibleAPRs;

public record GetEligibleAPRsQuery(Guid PurchaseRequestId)
    : IRequest<ApiResponse<List<EligibleAPRResponse>>>;