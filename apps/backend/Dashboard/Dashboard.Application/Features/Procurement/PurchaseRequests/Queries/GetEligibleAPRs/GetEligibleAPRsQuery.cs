using ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Queries.GetEligibleAPRs;

public record GetEligibleAPRsQuery(Guid? PurchaseRequestId = null, Guid? OfficeId = null)
    : IRequest<ApiResponse<List<EligibleAPRResponse>>>;