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
        _ = await unitOfWork.APPRepository.GetByIdAsync(request.AppId, cancellationToken)
            ?? throw new NotFoundException("APP not found.");

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

            if (entry.Schedules.Count == 0)
                continue;

            // Upsert APPProcurementSchedules on the tracked PPMPItem
            var schedules = appItem.PPMPItem.APPProcurementSchedules;

            foreach (var scheduleEntry in entry.Schedules)
            {
                var existing = schedules.FirstOrDefault(
                    s => s.ProcurementActivityTypeId == scheduleEntry.ProcurementActivityTypeId);

                if (existing is not null)
                {
                    existing.ScheduledDate = scheduleEntry.ScheduledDate;
                    existing.CustomDateText = scheduleEntry.CustomDateText;
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
