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

            // Update procurement strategy fields
            appItem.ProcurementModeId = entry.ModeOfProcurementId;
            appItem.Remarks = entry.Remarks;
            appItem.IsEarlyProcurementActivity = entry.EPAEligible;

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
