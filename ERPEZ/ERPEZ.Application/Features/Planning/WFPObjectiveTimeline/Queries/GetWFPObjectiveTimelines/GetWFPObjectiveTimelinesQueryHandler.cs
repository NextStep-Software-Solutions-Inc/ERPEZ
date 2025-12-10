using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Queries.GetWFPObjectiveTimelines;

public class GetWFPObjectiveTimelinesQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetWFPObjectiveTimelinesQuery, PaginatedApiResponse<Domain.Entities.Planning.WFPObjectiveTimeline>>
{
    public async Task<PaginatedApiResponse<Domain.Entities.Planning.WFPObjectiveTimeline>> Handle(
        GetWFPObjectiveTimelinesQuery query, 
        CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        var (timelines, totalCount) = await unitOfWork.WFPObjectiveTimelineRepository.GetAllAsync(sieveModel, cancellationToken);
        
        return new PaginatedApiResponse<Domain.Entities.Planning.WFPObjectiveTimeline>(
            [.. timelines],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
