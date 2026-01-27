using ERPEZ.Application.Features.Planning.Object.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Queries.GetWFPObjectiveTargets;

public class GetWFPObjectiveTargetsQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetWFPObjectiveTargetsQuery, PaginatedApiResponse<WFPObjectiveTargetResponse>>
{
    public async Task<PaginatedApiResponse<WFPObjectiveTargetResponse>> Handle(
        GetWFPObjectiveTargetsQuery query, 
        CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.WFPObjectiveTarget, WFPObjectiveTargetResponse>> projection = target => new WFPObjectiveTargetResponse
        {
            Id = target.Id,
            WFPObjectiveId = target.WFPObjectiveId,
            ActivityName = target.ActivityName,
            Indicator = target.Indicator,
            Weight = target.Weight,
            CreatedAt = target.CreatedAt,
            CreatedBy = target.CreatedBy,
            WFPObjectiveTimelines = target.WFPObjectiveTimelines.Select(t => new WFPObjectiveTimelineResponse
            {
                Id = t.Id,
                WFPObjectiveTargetId = t.WFPObjectiveTargetId,
                TimelineType = t.TimelineType.ToString(),
                StartDate = t.StartDate,
                EndDate = t.EndDate,
                TargetValue = t.TargetValue,
                CreatedAt = t.CreatedAt,
                CreatedBy = t.CreatedBy
            }).ToList(),
            WFPObjectiveTargetExpenditures = target.WFPObjectiveTargetExpenditures.Select(e => new WFPObjectiveTargetExpenditureResponse
            {
                Id = e.Id,
                WFPObjectiveTargetId = e.WFPObjectiveTargetId,
                ItemDescription = e.ItemDescription,
                Quantity = e.Quantity,
                CostEstimates = e.CostEstimates,
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
                    WFPObjectiveTargetExpenditureCount = e.Object.WFPObjectiveTargetExpenditures.Count,
                    Parent = null
                }
            }).ToList()
        };

        var (targets, totalCount) = await unitOfWork.WFPObjectiveTargetRepository.GetAllAsync(sieveModel, projection, cancellationToken);
        
        return new PaginatedApiResponse<WFPObjectiveTargetResponse>(
            [.. targets],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
