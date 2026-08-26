using ERPEZ.Application.Features.Planning.PPMP.Dtos;
using ERPEZ.Application.Features.Planning.PPMP.Queries.Common;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMP.Queries.GetPPMPById;

public class GetPPMPByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetPPMPByIdQuery, ApiResponse<PPMPDetailedResponse>>
{
    public async Task<ApiResponse<PPMPDetailedResponse>> Handle(GetPPMPByIdQuery query, CancellationToken cancellationToken)
    {
        var ppmp = await unitOfWork.PPMPRepository.GetPPMPWithDetailsAsync(query.Id, cancellationToken)
            ?? throw new NotFoundException("PPMP not found.");

        // ── Project-scope MSF (at most 1 lookup, or none if no LIBId) ────────
        MSFSummaryResponse? linkedMarketScoping = null;
        if (ppmp.LIBId.HasValue)
        {
            var msf = await unitOfWork.MarketScopingRepository
                .GetByTargetLineItemBudgetIdAsync(ppmp.LIBId.Value, cancellationToken);
            if (msf != null)
            {
                linkedMarketScoping = new MSFSummaryResponse
                {
                    Id = msf.Id,
                    ProjectName = msf.ProjectName,
                    EstimatedBudget = msf.EstimatedBudget,
                    Status = msf.Status.ToString(),
                };
            }
        }

        // ── Activity-scope MSFs — ONE batch query regardless of activity count ─
        Dictionary<Guid, MSFSummaryResponse> activityMsfMap = [];
        var libActivityIds = ppmp.PPMPActivities
            .Where(a => !a.IsDeleted)
            .Select(a => a.LIBActivityId)
            .Distinct()
            .ToList();

        if (libActivityIds.Count > 0)
        {
            var msfByActivity = await unitOfWork.MarketScopingRepository
                .GetByTargetLineItemBudgetActivityIdsAsync(libActivityIds, cancellationToken);

            activityMsfMap = msfByActivity.ToDictionary(
                kvp => kvp.Key,
                kvp => new MSFSummaryResponse
                {
                    Id = kvp.Value.Id,
                    ProjectName = kvp.Value.ProjectName,
                    EstimatedBudget = kvp.Value.EstimatedBudget,
                    Status = kvp.Value.Status.ToString(),
                });
        }

        return ApiResponse<PPMPDetailedResponse>.Success(
            PPMPQueryProjection.BuildDetailedResponse(ppmp, linkedMarketScoping, activityMsfMap));
    }
}
