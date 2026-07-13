using ERPEZ.Application.Features.Planning.Budgeting.Common;
using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;
using ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Dtos;
using ERPEZ.Application.Features.Planning.Budgeting.Common.Rules;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using CreateLIBDetailRequest = ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Dtos.CreateLineItemBudgetDetailRequest; // alias

namespace ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Commands.CreateLineItemBudgetDetail;

public class CreateLineItemBudgetDetailCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateLineItemBudgetDetailCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateLineItemBudgetDetailCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

        var lib = await unitOfWork.LineItemBudgetRepository.GetByIdAsync(request.LineItemBudgetId, cancellationToken)
            ?? throw new NotFoundException($"LIB with ID {request.LineItemBudgetId} not found.");

        if (!LIBRules.IsEditable(lib.Status))
            throw new ValidationException("Line item details can only be added to a Draft, Proposed, or Returned LIB.");

        var isProjectScope  = lib.Scope.Equals(LIBScopeEnum.Project.ToString(),  StringComparison.OrdinalIgnoreCase);
        var isActivityScope = lib.Scope.Equals(LIBScopeEnum.Activity.ToString(), StringComparison.OrdinalIgnoreCase);

        if (!isProjectScope && !isActivityScope)
            throw new ValidationException($"Unrecognized LIB scope '{lib.Scope}'.");

        Guid     resolvedObjectId;
        string?  resolvedDescription;
        int?     resolvedUnitQuantity;
        decimal? resolvedUnitCost;

        if (isProjectScope)
        {
            // Project scope: expenditure provided → auto-map + validate; absent → fully manual.
            if (request.WFPObjectiveActivityExpenditureId.HasValue)
            {
                (resolvedObjectId, resolvedDescription, resolvedUnitQuantity, resolvedUnitCost) =
                    await ResolveFromExpenditureAsync(request, cancellationToken);
            }
            else
            {
                if (!request.StartDate.HasValue || !request.EndDate.HasValue || string.IsNullOrWhiteSpace(request.TimelineType))
                    throw new ValidationException("StartDate, EndDate and TimelineType are required for manual Project scope LIBs.");

                (resolvedObjectId, resolvedDescription, resolvedUnitQuantity, resolvedUnitCost) =
                    ResolveFromManualInput(request);
            }
        }
        else // isActivityScope
        {
            if (request.WFPObjectiveActivityExpenditureId.HasValue && request.LineItemBudgetActivityId.HasValue)
                throw new ValidationException("Only one of WFPObjectiveActivityExpenditureId or LineItemBudgetActivityId may be provided, not both.");

            if (request.WFPObjectiveActivityExpenditureId.HasValue)
            {
                // Activity scope sourced from WFP expenditure — auto-map item fields, manual timeline.
                (resolvedObjectId, resolvedDescription, resolvedUnitQuantity, resolvedUnitCost) =
                    await ResolveFromExpenditureAsync(request, cancellationToken);
            }
            else if (request.LineItemBudgetActivityId.HasValue)
            {
                // Activity scope sourced from LIB Activity — fully manual.
                var activity = await unitOfWork.LineItemBudgetActivityRepository
                    .GetByIdAsync(request.LineItemBudgetActivityId.Value, cancellationToken)
                    ?? throw new NotFoundException($"LIB Activity with ID {request.LineItemBudgetActivityId} not found.");

                if (activity.LineItemBudgetId != request.LineItemBudgetId)
                    throw new ValidationException("Selected LIB Activity does not belong to the provided LIB.");

                if (!request.StartDate.HasValue || !request.EndDate.HasValue || string.IsNullOrWhiteSpace(request.TimelineType))
                    throw new ValidationException("StartDate, EndDate and TimelineType are required for Activity scope LIBs.");

                (resolvedObjectId, resolvedDescription, resolvedUnitQuantity, resolvedUnitCost) =
                    ResolveFromManualInput(request);
            }
            else
            {
                throw new ValidationException(
                    "Either WFPObjectiveActivityExpenditureId or LineItemBudgetActivityId is required for Activity scope LIBs.");
            }
        }

        var entity = new Domain.Entities.Planning.LineItemBudgetDetail
        {
            LineItemBudgetId                  = request.LineItemBudgetId,
            LineItemBudgetActivityId          = request.LineItemBudgetActivityId,
            WFPObjectiveActivityExpenditureId = request.WFPObjectiveActivityExpenditureId,
            ObjectId                          = resolvedObjectId,
            Description                       = resolvedDescription,
            UnitQuantity                      = resolvedUnitQuantity,
            UnitCost                          = resolvedUnitCost,
            TimelineType                      = request.TimelineType,
            StartDate                         = request.StartDate,
            EndDate                           = request.EndDate,
            Budget                            = request.Budget,
        };

        await unitOfWork.LineItemBudgetDetailRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "Line Item Budget Detail created successfully.");
    }

    private async Task<(Guid objectId, string? description, int? unitQuantity, decimal? unitCost)>
    ResolveFromExpenditureAsync(CreateLIBDetailRequest request, CancellationToken cancellationToken)
    {
        var expenditure = await unitOfWork.WFPObjectiveActivityExpenditureRepository
            .GetByIdAsync(request.WFPObjectiveActivityExpenditureId!.Value, cancellationToken)
            ?? throw new NotFoundException($"WFP Objective Activity Expenditure with ID {request.WFPObjectiveActivityExpenditureId} not found.");

        var timelines = await unitOfWork.WFPObjectiveTimelineRepository
            .GetByWFPObjectiveActivityIdAsync(expenditure.WFPObjectiveActivityId, cancellationToken);

        if (timelines.Count == 0)
            throw new NotFoundException($"No timelines found for WFP Objective Activity ID {expenditure.WFPObjectiveActivityId}.");

        var allowedStart = timelines.Min(t => t.StartDate);
        var allowedEnd   = timelines.Max(t => t.EndDate);

        if (!request.StartDate.HasValue || !request.EndDate.HasValue || string.IsNullOrWhiteSpace(request.TimelineType))
            throw new ValidationException("StartDate, EndDate and TimelineType are required.");

        var requestStart = DateOnly.FromDateTime(request.StartDate.Value);
        var requestEnd   = DateOnly.FromDateTime(request.EndDate.Value);

        if (requestStart < allowedStart || requestEnd > allowedEnd)
            throw new ValidationException(
                $"The supplied timeline ({requestStart} – {requestEnd}) must fall within the activity's " +
                $"timeline span ({allowedStart} – {allowedEnd}).");

        // Budget must be greater than or equal tothe computed cost (UnitCost * UnitQuantity).
        if (expenditure.UnitCost.HasValue && expenditure.Quantity.HasValue)
        {
            var computedCost = expenditure.UnitCost.Value * expenditure.Quantity.Value;
            if (request.Budget < computedCost)
                throw new ValidationException(
                    $"Budget ({request.Budget}) must be greater than or equal to the computed cost " +
                    $"(UnitCost {expenditure.UnitCost} × UnitQuantity {expenditure.Quantity} = {computedCost}).");
        }

        return (expenditure.ObjectId, expenditure.ItemDescription, expenditure.Quantity, expenditure.UnitCost);
    }

    private (Guid objectId, string? description, int? unitQuantity, decimal? unitCost)
        ResolveFromManualInput(CreateLIBDetailRequest request)
    {
        if (request.ObjectId == Guid.Empty)
            throw new ValidationException("ObjectId is required for manual input.");

        // Budget must be greater than or equal to the computed cost (UnitCost * UnitQuantity).
        if (request.UnitCost.HasValue && request.UnitQuantity.HasValue)
        {
            var computedCost = request.UnitCost.Value * request.UnitQuantity.Value;
            if (request.Budget < computedCost)
                throw new ValidationException(
                    $"Budget ({request.Budget}) must be greater than or equal to the computed cost " +
                    $"(UnitCost {request.UnitCost} × UnitQuantity {request.UnitQuantity} = {computedCost}).");
        }

        return (request.ObjectId, request.Description, request.UnitQuantity, request.UnitCost);
    }
}
