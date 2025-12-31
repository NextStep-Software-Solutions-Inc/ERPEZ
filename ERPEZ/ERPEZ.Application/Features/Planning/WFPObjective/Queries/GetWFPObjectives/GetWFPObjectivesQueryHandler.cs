using System.Linq.Expressions;
using ERPEZ.Application.Features.Planning.WFPObjective.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjective.Queries.GetWFPObjectives;

public class GetWFPObjectivesQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetWFPObjectivesQuery, PaginatedApiResponse<WFPObjectiveResponse>>
{
    public async Task<PaginatedApiResponse<WFPObjectiveResponse>> Handle(GetWFPObjectivesQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.WFPObjective, WFPObjectiveResponse>> projection = wfpObjective => new WFPObjectiveResponse
        {
            Id = wfpObjective.Id,
            WFPId = wfpObjective.WFPId,
            Description = wfpObjective.Description,
            Weight = wfpObjective.Weight,
            Outcome = wfpObjective.Outcome,
            CreatedAt = wfpObjective.CreatedAt,
            CreatedBy = wfpObjective.CreatedBy,
            WFPObjectiveTargetsCount = wfpObjective.WFPObjectiveTargets.Count,
            // WFPObjectiveTargets = wfpObjective.WFPObjectiveTargets.Select(target => new WFPObjectiveTargetResponse
            // {
            //     Id = target.Id,
            //     WFPObjectiveId = target.WFPObjectiveId,
            //     ActivityName = target.ActivityName,
            //     Indicator = target.Indicator,
            //     WFPObjectiveTargetExpenditures = target.WFPObjectiveTargetExpenditures.Select(expenditure => new WFPObjectiveTargetExpenditureResponse
            //     {
            //         Id = expenditure.Id,
            //         WFPObjectiveTargetId = expenditure.WFPObjectiveTargetId,
            //         ItemDescription = expenditure.ItemDescription,
            //         CostEstimates = expenditure.CostEstimates,
            //         Quantity = expenditure.Quantity,
            //         Object = new()
            //         {
            //             Id = expenditure.Object.Id,
            //             Name = expenditure.Object.Name,
            //             Code = expenditure.Object.Code,
            //             IsActive = expenditure.Object.IsActive,
            //             ChildObjectCount = expenditure.Object.ChildObjects.Count,
            //             TransactionCount = expenditure.Object.Transactions.Count,
            //             WFPObjectiveTargetExpenditureCount = expenditure.Object.WFPObjectiveTargetExpenditures.Count,
            //             Parent = expenditure.Object.ParentObject != null ? new()
            //             {
            //                 Id = expenditure.Object.ParentObject.Id,
            //                 Name = expenditure.Object.ParentObject.Name,
            //                 Code = expenditure.Object.ParentObject.Code,
            //                 IsActive = expenditure.Object.ParentObject.IsActive,
            //             } : null
            //         }
            //     }).ToList(),
            //     WFPObjectiveTimelines = target.WFPObjectiveTimelines.Select(timeline => new WFPObjectiveTimelineResponse
            //     {
            //         Id = timeline.Id,
            //         WFPObjectiveTargetId = timeline.WFPObjectiveTargetId,
            //         TargetValue = timeline.TargetValue,
            //         TimelineType = timeline.TimelineType.ToString(),
            //         StartDate = timeline.StartDate,
            //         EndDate = timeline.EndDate,
            //     }).ToList(),
            //     Weight = target.Weight,
            //     CreatedAt = target.CreatedAt,
            //     CreatedBy = target.CreatedBy
            // }).ToList()
        };

        var (wfpObjectives, totalCount) = await unitOfWork.WFPObjectiveRepository.GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<WFPObjectiveResponse>(
            [.. wfpObjectives],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
