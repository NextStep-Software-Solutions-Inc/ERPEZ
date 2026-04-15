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

        var entity = await unitOfWork.LineItemBudgetDetailRepository.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new NotFoundException($"Line Item Budget Detail with ID {command.Id} not found.");

        var lib = await unitOfWork.LineItemBudgetRepository.GetByIdAsync(request.LineItemBudgetId, cancellationToken)
            ?? throw new NotFoundException($"LIB with ID {request.LineItemBudgetId} not found.");

        if (!lib.Status.Equals("Draft", StringComparison.OrdinalIgnoreCase))
            throw new ERPEZ.Shared.Exceptions.ValidationException("Line item details can only be modified on a Draft LIB.");

        _ = await unitOfWork.ObjectRepository.GetByIdAsync(request.ObjectId, cancellationToken)
            ?? throw new NotFoundException($"Object with ID {request.ObjectId} not found.");

        // Source + scope validation
        var isWfp = lib.SourceType.Equals("WFP", StringComparison.OrdinalIgnoreCase);
        var isOpcr = lib.SourceType.Equals("OPCR", StringComparison.OrdinalIgnoreCase);
        var isProjectLevel = lib.Scope.Equals("ProjectLevel", StringComparison.OrdinalIgnoreCase);

        if (isWfp && !isProjectLevel)
        {
            if (!request.LineItemBudgetActivityId.HasValue)
                throw new ERPEZ.Shared.Exceptions.ValidationException("LineItemBudgetActivityId is required for WFP ActivityLevel LIBs.");
            if (request.WFPObjectiveActivityExpenditureId.HasValue)
                throw new ERPEZ.Shared.Exceptions.ValidationException("WFPObjectiveActivityExpenditureId must not be set for WFP ActivityLevel LIBs.");
        }
        else if (isWfp && isProjectLevel)
        {
            if (!request.WFPObjectiveActivityExpenditureId.HasValue)
                throw new ERPEZ.Shared.Exceptions.ValidationException("WFPObjectiveActivityExpenditureId is required for WFP ProjectLevel LIBs.");
            if (request.LineItemBudgetActivityId.HasValue)
                throw new ERPEZ.Shared.Exceptions.ValidationException("LineItemBudgetActivityId must not be set for WFP ProjectLevel LIBs.");
        }
        else if (isOpcr)
        {
            if (!request.LineItemBudgetActivityId.HasValue)
                throw new ERPEZ.Shared.Exceptions.ValidationException("LineItemBudgetActivityId is required for OPCR LIBs.");
            if (request.WFPObjectiveActivityExpenditureId.HasValue)
                throw new ERPEZ.Shared.Exceptions.ValidationException("WFPObjectiveActivityExpenditureId must not be set for OPCR LIBs.");
            if (!request.StartDate.HasValue || !request.EndDate.HasValue || string.IsNullOrWhiteSpace(request.TimelineType))
                throw new ERPEZ.Shared.Exceptions.ValidationException("StartDate, EndDate and TimelineType are required for OPCR LIBs.");
        }

        if (request.LineItemBudgetActivityId.HasValue)
        {
            var activity = await unitOfWork.LineItemBudgetActivityRepository.GetByIdAsync(request.LineItemBudgetActivityId.Value, cancellationToken)
                ?? throw new NotFoundException($"LIB Activity with ID {request.LineItemBudgetActivityId} not found.");

            if (activity.LineItemBudgetId != request.LineItemBudgetId)
                throw new ERPEZ.Shared.Exceptions.ValidationException("Selected LIB Activity does not belong to the provided LIB.");
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
        entity.UnitQuantity = request.UnitQuantity;
        entity.UnitCost = request.UnitCost;
        entity.TimelineType = request.TimelineType;
        entity.StartDate = request.StartDate;
        entity.EndDate = request.EndDate;
        entity.Budget = request.Budget;

        unitOfWork.LineItemBudgetDetailRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Line Item Budget Detail updated successfully.");
    }
}

