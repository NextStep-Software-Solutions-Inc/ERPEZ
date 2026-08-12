using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APP.Commands.UpdateBACLineItems;

public class UpdateBACLineItemsCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateBACLineItemsCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateBACLineItemsCommand request, CancellationToken cancellationToken)
    {
        var app = await unitOfWork.APPRepository.GetByIdAsync(request.AppId, cancellationToken)
            ?? throw new NotFoundException("APP not found.");

        var isFinalStr = app.IsFinal?.Trim().ToLowerInvariant();
        if (isFinalStr == "true" || isFinalStr == "final")
        {
            throw new ConflictException("Cannot update BAC line items because the APP is set to final.");
        }

        // Load APPItems with tracking so we can mutate schedule collections
        var appItems = await unitOfWork.APPItemRepository.GetAPPItemsWithDetailsAsync(
            request.AppId, cancellationToken);

        foreach (var entry in request.LineItems)
        {
            var appItem = appItems.FirstOrDefault(a => a.Id == entry.BACItemCode)
                ?? throw new NotFoundException($"APP line item '{entry.BACItemCode}' not found in this APP.");

            // Validation rules
            if (entry.EstimatedBudgetOverride.HasValue && entry.EstimatedBudgetOverride < 0)
            {
                throw new ValidationException("Estimated Budget / ABC cannot be negative.");
            }

            if (entry.StartOfProcurementOverride.HasValue && entry.EndOfProcurementOverride.HasValue &&
                entry.EndOfProcurementOverride < entry.StartOfProcurementOverride)
            {
                throw new ValidationException("End of Procurement cannot be earlier than Start of Procurement.");
            }

            // In an Updated APP, inherited items (IsNew == false) modified during revision are marked as IsRevised
            if (string.Equals(app.APPType, "Updated", StringComparison.OrdinalIgnoreCase) && !appItem.IsNew)
            {
                var modeChanged = appItem.ProcurementModeId != entry.ModeOfProcurementId;
                var remarksChanged = appItem.Remarks != entry.Remarks;
                var epaChanged = appItem.IsEarlyProcurementActivity != entry.EPAEligible;
                var epaRemarksChanged = appItem.EPARemarks != entry.EPARemarks;
                var startProcChanged = appItem.StartOfProcurementOverride != entry.StartOfProcurementOverride;
                var endProcChanged = appItem.EndOfProcurementOverride != entry.EndOfProcurementOverride;
                var budgetChanged = appItem.EstimatedBudgetOverride != entry.EstimatedBudgetOverride;
                var criteriaChanged = entry.BidEvaluationCriteria != null && appItem.BidEvaluationCriteria?.ToString() != entry.BidEvaluationCriteria;
                var outsourcedChanged = entry.IsOutsourced.HasValue && appItem.IsOutsourced != entry.IsOutsourced.Value;
                var schedulesProvided = entry.Schedules is not null && entry.Schedules.Count > 0;

                if (modeChanged || remarksChanged || epaChanged || epaRemarksChanged || startProcChanged || endProcChanged || budgetChanged || criteriaChanged || outsourcedChanged || schedulesProvided)
                {
                    appItem.IsRevised = true;
                }
            }

            // Update procurement strategy fields
            appItem.ProcurementModeId = entry.ModeOfProcurementId;
            appItem.Remarks = entry.Remarks;
            appItem.IsEarlyProcurementActivity = entry.EPAEligible;
            appItem.EPARemarks = entry.EPARemarks;
            appItem.StartOfProcurementOverride = entry.StartOfProcurementOverride;
            appItem.EndOfProcurementOverride = entry.EndOfProcurementOverride;
            appItem.EstimatedBudgetOverride = entry.EstimatedBudgetOverride;
            if (entry.IsOutsourced.HasValue) appItem.IsOutsourced = entry.IsOutsourced.Value;
            if (entry.BidEvaluationCriteria != null)
            {
                appItem.BidEvaluationCriteria = Enum.Parse<ERPEZ.Domain.Enums.BidEvaluationCriteria>(entry.BidEvaluationCriteria, true);
            }
            if (entry.ProcurementStrategies != null)
            {
                appItem.ProcurementStrategies = entry.ProcurementStrategies.Select(s => Enum.Parse<ERPEZ.Domain.Enums.ProcurementStrategy>(s, true)).ToList();
            }

            if (entry.Schedules is null)
                continue;

            // Sync APPProcurementSchedules on the tracked PPMPItem
            var schedules = appItem.PPMPItem.APPProcurementSchedules;

            // Remove existing schedules not present in the new list
            var requestActivityTypeIds = entry.Schedules.Select(s => s.ProcurementActivityTypeId).ToHashSet();
            var existingNonDeleted = schedules.Where(s => !s.IsDeleted).ToList();
            var schedulesToRemove = existingNonDeleted
                .Where(s => !requestActivityTypeIds.Contains(s.ProcurementActivityTypeId))
                .ToList();

            foreach (var scheduleToRemove in schedulesToRemove)
            {
                unitOfWork.APPItemScheduleRepository.Remove(scheduleToRemove);
            }

            foreach (var scheduleEntry in entry.Schedules)
            {
                var existing = schedules.FirstOrDefault(
                    s => s.ProcurementActivityTypeId == scheduleEntry.ProcurementActivityTypeId);

                if (existing is not null)
                {
                    existing.ScheduledDate = scheduleEntry.ScheduledDate;
                    existing.CustomDateText = scheduleEntry.CustomDateText;
                    existing.IsDeleted = false;
                    existing.DeletedAt = null;
                    existing.DeletedBy = null;
                }
                else
                {
                    schedules.Add(new APPProcurementSchedule
                    {
                        Id = Guid.NewGuid(),
                        PPMPItemId = appItem.PPMPItemId,
                        ProcurementActivityTypeId = scheduleEntry.ProcurementActivityTypeId,
                        ScheduledDate = scheduleEntry.ScheduledDate,
                        CustomDateText = scheduleEntry.CustomDateText
                    });
                }
            }
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value);
    }
}
