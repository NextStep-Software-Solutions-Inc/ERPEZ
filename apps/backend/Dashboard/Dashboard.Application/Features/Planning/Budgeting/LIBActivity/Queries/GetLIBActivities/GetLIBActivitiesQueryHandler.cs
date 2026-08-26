using ERPEZ.Application.Features.Planning.Budgeting.LIBActivity.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIBActivity.Queries.GetLIBActivities;

public class GetLIBActivitiesQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetLIBActivitiesQuery, PaginatedApiResponse<LIBActivityResponse>>
{
    public async Task<PaginatedApiResponse<LIBActivityResponse>> Handle(GetLIBActivitiesQuery request, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            Page = request.PageNumber,
            PageSize = request.PageSize,
            Filters = request.Filters,
            Sorts = request.Sorts
        };

        var (entities, totalCount) = await unitOfWork.LineItemBudgetActivityRepository
            .GetAllWithDetailsAsync(sieveModel, cancellationToken);

        var items = entities.Select(entity => new LIBActivityResponse
                {
                    Id = entity.Id,
                    LineItemBudgetId = entity.LineItemBudgetId,
                    WFPObjectiveActivityId = entity.WFPObjectiveActivityId,
                    OPCRActivityId = entity.OPCRActivityId,
                    Name = entity.Name,
                    Budget = entity.LineItemBudgetDetails.Sum(d => d.Budget), 
                    LineItemBudget = entity.LineItemBudget == null ? null : new LIBActivityLineItemBudgetResponse
                    {
                        Id = entity.LineItemBudget.Id,
                        LIBNumber = entity.LineItemBudget.LIBNumber,
                        Name = entity.LineItemBudget.Name ?? string.Empty
                    },
                    WFPObjectiveActivity = entity.WFPObjectiveActivity == null ? null : new LIBActivityWFPResponse
                    {
                        Id = entity.WFPObjectiveActivity.Id,
                        ActivityName = entity.WFPObjectiveActivity.ActivityName
                    },
                    OPCRActivity = entity.OPCRActivity == null ? null : new LIBActivityOPCRResponse
                    {
                        Id = entity.OPCRActivity.Id,
                        Name = entity.OPCRActivity.Name,
                        Description = entity.OPCRActivity.Description,
                        Budget = entity.OPCRActivity.Budget,
                        PAPDepartments = entity.OPCRActivity.OPCRPAPDepartments
                            .Select(p => p.OfficeId)
                            .ToList()
                    }
                })
            .ToList();

        return new PaginatedApiResponse<LIBActivityResponse>(items, request.PageNumber, request.PageSize, totalCount);
    }
}

