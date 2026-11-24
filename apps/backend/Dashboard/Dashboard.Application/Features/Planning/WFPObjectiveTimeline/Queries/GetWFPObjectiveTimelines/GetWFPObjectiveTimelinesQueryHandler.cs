using ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Queries.GetWFPObjectiveTimelines;

public class GetWFPObjectiveTimelinesQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetWFPObjectiveTimelinesQuery, PaginatedApiResponse<WFPObjectiveTimelineResponse>>
{
    public async Task<PaginatedApiResponse<WFPObjectiveTimelineResponse>> Handle(
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

        Expression<Func<Domain.Entities.Planning.WFPObjectiveTimeline, WFPObjectiveTimelineResponse>> projection = timeline => new WFPObjectiveTimelineResponse
        {
            Id = timeline.Id,
            WFPObjectiveActivityId = timeline.WFPObjectiveActivityId,
            TimelineType = timeline.TimelineType.ToString(),
            StartDate = timeline.StartDate,
            EndDate = timeline.EndDate,
            TargetValue = timeline.TargetValue,
            CreatedAt = timeline.CreatedAt,
            CreatedBy = timeline.CreatedBy
        };

        var (timelines, totalCount) = await unitOfWork.WFPObjectiveTimelineRepository.GetAllAsync(sieveModel, projection, cancellationToken);
        
        return new PaginatedApiResponse<WFPObjectiveTimelineResponse>(
            [.. timelines],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
