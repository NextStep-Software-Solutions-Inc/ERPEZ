using ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Queries.GetLineItemBudgetDetailById;

public class GetLineItemBudgetDetailByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetLineItemBudgetDetailByIdQuery, ApiResponse<LineItemBudgetDetailResponse>>
{
    public async Task<ApiResponse<LineItemBudgetDetailResponse>> Handle(GetLineItemBudgetDetailByIdQuery query, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.LineItemBudgetDetailRepository.GetByIdWithDetailsAsync(query.Id, cancellationToken)
            ?? throw new NotFoundException($"Line Item Budget Detail with ID {query.Id} not found.");

        var item = new LineItemBudgetDetailResponse
        {
            Id = entity.Id,
            LineItemBudgetId = entity.LineItemBudgetId,
            LineItemBudgetActivityId = entity.LineItemBudgetActivityId,
            WFPObjectiveActivityExpenditureId = entity.WFPObjectiveActivityExpenditureId,
            ObjectId = entity.ObjectId,
            Description = entity.Description,
            TimelineType = entity.TimelineType,
            StartDate = entity.StartDate,
            EndDate = entity.EndDate,
            Budget = entity.Budget,
            ExpenseClassId = entity.ExpenseClassId,
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
            },
            ExpenseClass = entity.ExpenseClass == null ? null : new LineItemBudgetDetailExpenseClassResponse
            {
                Id = entity.ExpenseClass.Id,
                Name = entity.ExpenseClass.Name,
                Code = entity.ExpenseClass.Code,
                Type = entity.ExpenseClass.Type.ToString()
            }
        };

        return ApiResponse<LineItemBudgetDetailResponse>.Success(item);
    }
}

