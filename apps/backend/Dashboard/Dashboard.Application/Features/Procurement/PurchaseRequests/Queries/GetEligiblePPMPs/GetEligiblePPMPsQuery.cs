using ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Queries.GetEligiblePPMPs;

public record GetEligiblePPMPsQuery(Guid? PurchaseRequestId = null, Guid? OfficeId = null)
    : IRequest<ApiResponse<List<EligiblePPMPResponse>>>;