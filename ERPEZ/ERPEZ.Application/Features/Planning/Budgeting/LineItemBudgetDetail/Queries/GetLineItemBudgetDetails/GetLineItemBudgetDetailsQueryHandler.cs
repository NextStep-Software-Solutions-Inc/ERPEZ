using ERPEZ.Application.Features.Planning.Budgeting.Common;
using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;
using ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Queries.GetLineItemBudgetDetails;

public class GetLineItemBudgetDetailsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetLineItemBudgetDetailsQuery, PaginatedApiResponse<LineItemBudgetDetailResponse>>
{
    public async Task<PaginatedApiResponse<LineItemBudgetDetailResponse>> Handle(GetLineItemBudgetDetailsQuery request, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            Page = request.PageNumber,
            PageSize = request.PageSize,
            Filters = request.Filters,
            Sorts = request.Sorts
        };

        var (entities, totalCount) = await unitOfWork.LineItemBudgetDetailRepository
            .GetAllWithDetailsAsync(sieveModel, cancellationToken);

        var items = entities.Select(entity => new LineItemBudgetDetailResponse
                {
                    Id = entity.Id,
                    LineItemBudgetId = entity.LineItemBudgetId,
                    LineItemBudgetActivityId = entity.LineItemBudgetActivityId,
                    WFPObjectiveActivityExpenditureId = entity.WFPObjectiveActivityExpenditureId,
                    ObjectId = entity.ObjectId,
                    Description = entity.Description,
                    TimelineType = Enum.Parse<LIBTimelineTypeEnum>(entity.TimelineType, true),
                    StartDate = entity.StartDate,
                    EndDate = entity.EndDate,
                    Budget = entity.Budget,
                    LineItemBudget = entity.LineItemBudget == null ? null : new LineItemBudgetDetailLIBResponse
                    {
                        Id = entity.LineItemBudget.Id,
                        LIBNumber = entity.LineItemBudget.LIBNumber,
                        Name = entity.LineItemBudget.Name ?? string.Empty
                    },
                    LineItemBudgetActivity = entity.LineItemBudgetActivity == null ? null : new LineItemBudgetDetailActivityResponse
                    {
                        Id = entity.LineItemBudgetActivity.Id,
                        Name = entity.LineItemBudgetActivity.Name
                    },
                    Object = entity.Object == null ? null : new LineItemBudgetDetailObjectResponse
                    {
                        Id = entity.Object.Id,
                        Name = entity.Object.Name,
                        Code = entity.Object.Code
                    },
                    WFPObjectiveActivityExpenditure = entity.WFPObjectiveActivityExpenditure == null ? null : new LineItemBudgetDetailWFPExpenditureResponse
                    {
                        Id = entity.WFPObjectiveActivityExpenditure.Id,
                        ItemDescription = entity.WFPObjectiveActivityExpenditure.ItemDescription,
                        Quantity = entity.WFPObjectiveActivityExpenditure.Quantity,
                        UnitCost = entity.WFPObjectiveActivityExpenditure.UnitCost
                    }
                })
            .ToList();

        return new PaginatedApiResponse<LineItemBudgetDetailResponse>(items, request.PageNumber, request.PageSize, totalCount);
    }
}

