using ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Queries.GetWFPObjectiveTimelines;

public class GetWFPObjectiveTimelinesQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetWFPObjectiveTimelinesQuery, PaginatedApiResponse<WFPObjectiveTimelineResponse>>
{
    public async Task<PaginatedApiResponse<WFPObjectiveTimelineResponse>> Handle(GetWFPObjectiveTimelinesQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        Expression<Func<Domain.Entities.Planning.WFPObjectiveTimeline, WFPObjectiveTimelineResponse>> projection = c => new WFPObjectiveTimelineResponse
        {
            Id = c.Id,
            WFPObjectiveTargetId = c.WFPObjectiveTargetId,
            StartDate = c.StartDate,
            EndDate = c.EndDate,
            TargetValue = c.TargetValue,
            CreatedAt = c.CreatedAt,
            CreatedBy = c.CreatedBy
        };
        var (wfpObjectiveTimelines, totalCount) = await unitOfWork.WFPObjectiveTimelineRepository.GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);

        return new PaginatedApiResponse<WFPObjectiveTimelineResponse>(
            [.. wfpObjectiveTimelines],
            query.PageNumber,
            query.PageSize,
            totalCount
            );
    }
}

