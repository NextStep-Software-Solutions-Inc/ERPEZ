using ERPEZ.Application.Features.Planning.Object.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjectiveActivity.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjectiveActivityExpenditure.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveActivity.Queries.GetWFPObjectiveActivities;

public class GetWFPObjectiveActivitiesQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetWFPObjectiveActivitiesQuery, PaginatedApiResponse<WFPObjectiveActivityResponse>>
{
    public async Task<PaginatedApiResponse<WFPObjectiveActivityResponse>> Handle(
        GetWFPObjectiveActivitiesQuery query, 
        CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.WFPObjectiveActivity, WFPObjectiveActivityResponse>> projection = target => new WFPObjectiveActivityResponse
        {
            Id = target.Id,
            WFPObjectiveId = target.WFPObjectiveId ?? Guid.Empty,
            ActivityName = target.ActivityName,
            Indicator = target.Indicator,
            Weight = target.Weight,
            CreatedAt = target.CreatedAt,
            CreatedBy = target.CreatedBy,
            WFPObjectiveTimelines = target.WFPObjectiveTimelines.Select(t => new WFPObjectiveTimelineResponse
            {
                Id = t.Id,
                WFPObjectiveActivityId = t.WFPObjectiveActivityId,
                TimelineType = t.TimelineType.ToString(),
                StartDate = t.StartDate,
                EndDate = t.EndDate,
                TargetValue = t.TargetValue,
                CreatedAt = t.CreatedAt,
                CreatedBy = t.CreatedBy
            }).ToList(),
            WFPObjectiveActivityExpenditures = target.WFPObjectiveActivityExpenditures.Select(e => new WFPObjectiveActivityExpenditureResponse
            {
                Id = e.Id,
                WFPObjectiveActivityId = e.WFPObjectiveActivityId,
                ItemDescription = e.ItemDescription,
                Quantity = e.Quantity ?? 0,
                UnitCost = e.UnitCost ?? 0,
                CreatedAt = e.CreatedAt,
                CreatedBy = e.CreatedBy,
                Object = new ObjectResponse
                {
                    Id = e.Object.Id,
                    Name = e.Object.Name,
                    Code = e.Object.Code,
                    IsActive = e.Object.IsActive,
                    ChildObjectCount = e.Object.ChildObjects.Count,
                    TransactionCount = e.Object.Transactions.Count,
                    WFPObjectiveActivityExpenditureCount = e.Object.WFPObjectiveActivityExpenditures.Count,
                    Parent = null
                }
            }).ToList()
        };

        var (targets, totalCount) = await unitOfWork.WFPObjectiveActivityRepository.GetAllAsync(sieveModel, projection, cancellationToken);
        
        return new PaginatedApiResponse<WFPObjectiveActivityResponse>(
            [.. targets],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
