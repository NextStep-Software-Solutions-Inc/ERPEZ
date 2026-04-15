using ERPEZ.Application.Features.Planning.Budgeting.Common;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Commands.CreateLineItemBudgetDetail;

public class CreateLineItemBudgetDetailCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateLineItemBudgetDetailCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateLineItemBudgetDetailCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

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

        var entity = new Domain.Entities.Planning.LineItemBudgetDetail
        {
            LineItemBudgetId = request.LineItemBudgetId,
            LineItemBudgetActivityId = request.LineItemBudgetActivityId,
            WFPObjectiveActivityExpenditureId = request.WFPObjectiveActivityExpenditureId,
            ObjectId = request.ObjectId,
            Description = request.Description,
            TimelineType = request.TimelineType,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Budget = request.Budget
        };

        await unitOfWork.LineItemBudgetDetailRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "Line Item Budget Detail created successfully.");
    }
}

