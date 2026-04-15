using ERPEZ.Application.Features.Planning.Budgeting.LIBActivity.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIBActivity.Queries.GetLIBActivityById;

public class GetLIBActivityByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetLIBActivityByIdQuery, ApiResponse<LIBActivityResponse>>
{
    public async Task<ApiResponse<LIBActivityResponse>> Handle(GetLIBActivityByIdQuery query, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.LineItemBudgetActivityRepository.GetByIdWithDetailsAsync(query.Id, cancellationToken)
            ?? throw new NotFoundException($"LIB Activity with ID {query.Id} not found.");

        var item = new LIBActivityResponse
        {
            Id = entity.Id,
            LineItemBudgetId = entity.LineItemBudgetId,
            WFPObjectiveActivityId = entity.WFPObjectiveActivityId,
            OPCRActivityId = entity.OPCRActivityId,
            Name = entity.Name,
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
                Name = entity.OPCRActivity.Name
            },
            Details = entity.LineItemBudgetDetails
                .Where(d => !d.IsDeleted)
                .Select(d => new LIBActivityNestedDetailResponse
                {
                    Id = d.Id,
                    ObjectId = d.ObjectId,
                    ObjectName = d.Object?.Name,
                    ObjectCode = d.Object?.Code,
                    ExpenseClassId = d.ExpenseClassId,
                    ExpenseClassName = d.ExpenseClass?.Name,
                    ExpenseClassType = d.ExpenseClass?.Type.ToString(),
                    WFPObjectiveActivityExpenditureId = d.WFPObjectiveActivityExpenditureId,
                    Description = d.Description,
                    UnitQuantity = d.UnitQuantity,
                    UnitCost = d.UnitCost,
                    TimelineType = d.TimelineType,
                    StartDate = d.StartDate,
                    EndDate = d.EndDate,
                    Budget = d.Budget,
                    BudgetAllocations = d.BudgetAllocations
                        .Where(b => !b.IsDeleted)
                        .Select(b => new LIBActivityNestedAllocationResponse
                        {
                            Id = b.Id,
                            BudgetPeriod = b.BudgetPeriod,
                            StartDate = b.StartDate,
                            EndDate = b.EndDate,
                            TotalAllocated = b.TotalAllocated
                        })
                        .ToList()
                })
                .ToList()
        };

        return ApiResponse<LIBActivityResponse>.Success(item);
    }
}

