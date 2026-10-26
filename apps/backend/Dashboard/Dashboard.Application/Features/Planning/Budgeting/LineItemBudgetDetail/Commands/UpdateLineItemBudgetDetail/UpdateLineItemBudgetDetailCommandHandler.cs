using ERPEZ.Application.Features.Planning.Budgeting.Common;
using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;
using ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Dtos;
using ERPEZ.Application.Features.Planning.Budgeting.Common.Rules;
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

        await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            var entity = await unitOfWork.LineItemBudgetDetailRepository.GetByIdAsync(command.Id, cancellationToken)
                ?? throw new NotFoundException($"Line Item Budget Detail with ID {command.Id} not found.");

            var effectiveLibId = request.LineItemBudgetId ?? entity.LineItemBudgetId;

            var lib = await unitOfWork.LineItemBudgetRepository.GetByIdAsync(effectiveLibId, cancellationToken)
                ?? throw new NotFoundException($"LIB with ID {effectiveLibId} not found.");

            if (!LIBRules.IsEditable(lib.Status))
            {
                var isUnderActiveAmendment = await unitOfWork.LIBAmendmentRequestRepository
                    .FindAsync(ar => ar.ProposedLineItemBudgetId == effectiveLibId &&
                        (ar.Status == "Draft" || ar.Status == "Returned"), cancellationToken) != null;

                if (!isUnderActiveAmendment)
                    throw new ValidationException("Line item details can only be modified on a Draft, Proposed, or Returned LIB.");
            }

            var isProjectScope  = lib.Scope.Equals(LIBScopeEnum.Project.ToString(),  StringComparison.OrdinalIgnoreCase);
            var isActivityScope = lib.Scope.Equals(LIBScopeEnum.Activity.ToString(), StringComparison.OrdinalIgnoreCase);

            if (!isProjectScope && !isActivityScope)
                throw new ValidationException($"Unrecognized LIB scope '{lib.Scope}'.");

            var effectiveExpenditureId = request.WFPObjectiveActivityExpenditureId ?? entity.WFPObjectiveActivityExpenditureId;
            var effectiveActivityId    = request.LineItemBudgetActivityId ?? entity.LineItemBudgetActivityId;
            var effectiveBudget        = request.Budget ?? entity.Budget;

            Guid     resolvedObjectId;
            string?  resolvedDescription;
            int?     resolvedUnitQuantity;
            decimal? resolvedUnitCost;

            if (isProjectScope)
            {
                if (effectiveExpenditureId.HasValue)
                {
                    (resolvedObjectId, resolvedDescription, resolvedUnitQuantity, resolvedUnitCost) =
                        await ResolveFromExpenditureAsync(effectiveExpenditureId.Value, request, entity, effectiveBudget, cancellationToken);
                }
                else
                {
                    EnsureTimelineFieldsPresent(request, entity);

                    (resolvedObjectId, resolvedDescription, resolvedUnitQuantity, resolvedUnitCost) =
                        ResolveFromManualInput(request, entity, effectiveBudget);
                }
            }
            else // isActivityScope
            {
                if (effectiveExpenditureId.HasValue && effectiveActivityId.HasValue)
                    throw new ValidationException("Only one of WFPObjectiveActivityExpenditureId or LineItemBudgetActivityId may be set, not both.");

                if (effectiveExpenditureId.HasValue)
                {
                    (resolvedObjectId, resolvedDescription, resolvedUnitQuantity, resolvedUnitCost) =
                        await ResolveFromExpenditureAsync(effectiveExpenditureId.Value, request, entity, effectiveBudget, cancellationToken);
                }
                else if (effectiveActivityId.HasValue)
                {
                    var activity = await unitOfWork.LineItemBudgetActivityRepository
                        .GetByIdForUpdateAsync(effectiveActivityId.Value, cancellationToken)
                        ?? await unitOfWork.LineItemBudgetActivityRepository
                            .GetByIdWithDetailsAsync(effectiveActivityId.Value, cancellationToken)
                        ?? throw new NotFoundException($"LIB Activity with ID {effectiveActivityId} not found.");

                    if (activity.LineItemBudgetId != effectiveLibId)
                        throw new ValidationException("Selected LIB Activity does not belong to the provided LIB.");

                    EnsureTimelineFieldsPresent(request, entity);

                    if (lib.SourceType.Equals("OPCR", StringComparison.OrdinalIgnoreCase) && activity.OPCRActivityId.HasValue)
                    {
                        var opcrActivity = activity.OPCRActivity
                            ?? await unitOfWork.OPCRActivityRepository.GetByIdAsync(activity.OPCRActivityId.Value, cancellationToken)
                            ?? throw new NotFoundException($"OPCR Activity with ID {activity.OPCRActivityId} not found.");

                        var currentOtherDetailsSum = activity.LineItemBudgetDetails
                            .Where(d => !d.IsDeleted && d.Id != entity.Id)
                            .Sum(d => d.Budget);

                        var effectiveTotal = currentOtherDetailsSum + effectiveBudget;
                        if (effectiveTotal > opcrActivity.Budget)
                        {
                            var availableBudget = opcrActivity.Budget - currentOtherDetailsSum;
                            throw new ValidationException(
                                $"Expenditure exceeds available OPCR Activity budget. Available: ₱{availableBudget:N2}; Requested: ₱{effectiveBudget:N2}.");
                        }
                    }

                    (resolvedObjectId, resolvedDescription, resolvedUnitQuantity, resolvedUnitCost) =
                        ResolveFromManualInput(request, entity, effectiveBudget);
                }
                else
                {
                    throw new ValidationException(
                        "Either WFPObjectiveActivityExpenditureId or LineItemBudgetActivityId is required for Activity scope LIBs.");
                }
            }

            entity.LineItemBudgetId                  = effectiveLibId;
            entity.LineItemBudgetActivityId          = effectiveActivityId;
            entity.WFPObjectiveActivityExpenditureId = effectiveExpenditureId;
            entity.ObjectId                          = resolvedObjectId;
            entity.Description                       = resolvedDescription;
            entity.UnitQuantity                       = resolvedUnitQuantity;
            entity.UnitCost                           = resolvedUnitCost;
            entity.TimelineType                       = request.TimelineType ?? entity.TimelineType;
            entity.StartDate                          = request.StartDate ?? entity.StartDate;
            entity.EndDate                            = request.EndDate ?? entity.EndDate;
            entity.Budget                             = effectiveBudget;

            unitOfWork.LineItemBudgetDetailRepository.Update(entity);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }, cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Line Item Budget Detail updated successfully.");
    }

    private static void EnsureTimelineFieldsPresent(UpdateLineItemBudgetDetailRequest request, Domain.Entities.Planning.LineItemBudgetDetail entity)
    {
        var startDate    = request.StartDate ?? entity.StartDate;
        var endDate      = request.EndDate ?? entity.EndDate;
        var timelineType = request.TimelineType ?? entity.TimelineType;

        if (!startDate.HasValue || !endDate.HasValue || string.IsNullOrWhiteSpace(timelineType))
            throw new ValidationException("StartDate, EndDate and TimelineType are required.");
    }

    private async Task<(Guid objectId, string? description, int? unitQuantity, decimal? unitCost)>
        ResolveFromExpenditureAsync(
            Guid expenditureId,
            UpdateLineItemBudgetDetailRequest request,
            Domain.Entities.Planning.LineItemBudgetDetail entity,
            decimal effectiveBudget,
            CancellationToken cancellationToken)
    {
        var expenditure = await unitOfWork.WFPObjectiveActivityExpenditureRepository
            .GetByIdAsync(expenditureId, cancellationToken)
            ?? throw new NotFoundException($"WFP Objective Activity Expenditure with ID {expenditureId} not found.");

        var timelines = await unitOfWork.WFPObjectiveTimelineRepository
            .GetByWFPObjectiveActivityIdAsync(expenditure.WFPObjectiveActivityId, cancellationToken);

        if (timelines.Count == 0)
            throw new NotFoundException($"No timelines found for WFP Objective Activity ID {expenditure.WFPObjectiveActivityId}.");

        var allowedStart = timelines.Min(t => t.StartDate);
        var allowedEnd   = timelines.Max(t => t.EndDate);

        var effectiveStartDate    = request.StartDate ?? entity.StartDate;
        var effectiveEndDate      = request.EndDate ?? entity.EndDate;
        var effectiveTimelineType = request.TimelineType ?? entity.TimelineType;

        if (!effectiveStartDate.HasValue || !effectiveEndDate.HasValue || string.IsNullOrWhiteSpace(effectiveTimelineType))
            throw new ValidationException("StartDate, EndDate and TimelineType are required.");

        var requestStart = DateOnly.FromDateTime(effectiveStartDate.Value);
        var requestEnd   = DateOnly.FromDateTime(effectiveEndDate.Value);

        if (requestStart < allowedStart || requestEnd > allowedEnd)
            throw new ValidationException(
                $"The supplied timeline ({requestStart} – {requestEnd}) must fall within the activity's " +
                $"timeline span ({allowedStart} – {allowedEnd}).");

        if (expenditure.UnitCost.HasValue && expenditure.Quantity.HasValue)
        {
            var computedCost = expenditure.UnitCost.Value * expenditure.Quantity.Value;
            if (effectiveBudget < computedCost)
                throw new ValidationException(
                    $"Budget ({effectiveBudget}) must be greater than or equal to the computed cost " +
                    $"(UnitCost {expenditure.UnitCost} × UnitQuantity {expenditure.Quantity} = {computedCost}).");
        }

        return (expenditure.ObjectId, expenditure.ItemDescription, expenditure.Quantity, expenditure.UnitCost);
    }

    private (Guid objectId, string? description, int? unitQuantity, decimal? unitCost)
        ResolveFromManualInput(UpdateLineItemBudgetDetailRequest request, Domain.Entities.Planning.LineItemBudgetDetail entity, decimal effectiveBudget)
    {
        var effectiveObjectId     = request.ObjectId ?? entity.ObjectId;
        var effectiveDescription  = request.Description ?? entity.Description;
        var effectiveUnitQuantity = request.UnitQuantity ?? entity.UnitQuantity;
        var effectiveUnitCost     = request.UnitCost ?? entity.UnitCost;

        if (effectiveObjectId == Guid.Empty)
            throw new ValidationException("ObjectId is required for manual input.");

        if (effectiveUnitCost.HasValue && effectiveUnitQuantity.HasValue)
        {
            var computedCost = effectiveUnitCost.Value * effectiveUnitQuantity.Value;
            if (effectiveBudget < computedCost)
                throw new ValidationException(
                    $"Budget ({effectiveBudget}) must be greater than or equal to the computed cost " +
                    $"(UnitCost {effectiveUnitCost} × UnitQuantity {effectiveUnitQuantity} = {computedCost}).");
        }

        return (effectiveObjectId, effectiveDescription, effectiveUnitQuantity, effectiveUnitCost);
    }
}
