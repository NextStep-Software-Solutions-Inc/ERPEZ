using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.ConsolidatedPR.RemovePRFromConsolidated;

public record RemovePRFromConsolidatedCommand(
    Guid ConsolidatedPRId,
    Guid PurchaseRequestId      // removes all ConsolidatedPRItems belonging to this PR
) : IRequest<ApiResponse<Unit>>;