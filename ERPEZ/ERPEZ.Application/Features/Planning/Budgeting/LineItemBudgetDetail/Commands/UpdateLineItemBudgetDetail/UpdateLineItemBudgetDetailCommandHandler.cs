using ERPEZ.Application.Features.Planning.Budgeting.Common;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Commands.UpdateLineItemBudgetDetail;

public class UpdateLineItemBudgetDetailCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateLineItemBudgetDetailCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateLineItemBudgetDetailCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

        var entity = await unitOfWork.LineItemBudgetDetailRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException($"Line Item Budget Detail with ID {request.Id} not found.");

        _ = await unitOfWork.LineItemBudgetRepository.GetByIdAsync(request.LineItemBudgetId, cancellationToken)
            ?? throw new NotFoundException($"LIB with ID {request.LineItemBudgetId} not found.");

        _ = await unitOfWork.ObjectRepository.GetByIdAsync(request.ObjectId, cancellationToken)
            ?? throw new NotFoundException($"Object with ID {request.ObjectId} not found.");

        if (request.LineItemBudgetActivityId.HasValue)
        {
            var activity = await unitOfWork.LineItemBudgetActivityRepository.GetByIdAsync(request.LineItemBudgetActivityId.Value, cancellationToken)
                ?? throw new NotFoundException($"LIB Activity with ID {request.LineItemBudgetActivityId} not found.");

            if (activity.LineItemBudgetId != request.LineItemBudgetId)
            {
                throw new ERPEZ.Shared.Exceptions.ValidationException("Selected LIB Activity does not belong to the provided LIB.");
            }
        }

        if (request.WFPObjectiveActivityExpenditureId.HasValue)
        {
            _ = await unitOfWork.WFPObjectiveActivityExpenditureRepository.GetByIdAsync(request.WFPObjectiveActivityExpenditureId.Value, cancellationToken)
                ?? throw new NotFoundException($"WFP Objective Activity Expenditure with ID {request.WFPObjectiveActivityExpenditureId} not found.");
        }

        entity.LineItemBudgetId = request.LineItemBudgetId;
        entity.LineItemBudgetActivityId = request.LineItemBudgetActivityId;
        entity.WFPObjectiveActivityExpenditureId = request.WFPObjectiveActivityExpenditureId;
        entity.ObjectId = request.ObjectId;
        entity.Description = request.Description;
        entity.TimelineType = request.TimelineType.ToString();
        entity.StartDate = request.StartDate;
        entity.EndDate = request.EndDate;
        entity.Budget = request.Budget;

        unitOfWork.LineItemBudgetDetailRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Line Item Budget Detail updated successfully.");
    }
}

