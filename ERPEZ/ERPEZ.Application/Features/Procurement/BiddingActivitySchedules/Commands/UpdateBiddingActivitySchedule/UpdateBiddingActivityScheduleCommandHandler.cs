using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.BiddingActivitySchedules.Commands.UpdateBiddingActivitySchedule;

public class UpdateBiddingActivityScheduleCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateBiddingActivityScheduleCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateBiddingActivityScheduleCommand request, CancellationToken cancellationToken)
    {
        var activityType = await unitOfWork.ProcurementActivityTypeRepository.GetByIdAsync(request.ScheduleRequest.ProcurementActivityTypeId, cancellationToken);
        if (activityType == null)
        {
            return ApiResponse<Unit>.Fail("Procurement activity type not found.");
        }

        // Get all schedules for the project to cascade updates if needed
        var projectSchedules = await unitOfWork.BiddingActivityScheduleRepository.Query()
            .Where(s => s.ProcurementProjectId == request.ProjectId)
            .ToListAsync(cancellationToken);

        var currentSchedule = projectSchedules.FirstOrDefault(s => s.Id == request.ScheduleId);
        if (currentSchedule == null)
        {
            return ApiResponse<Unit>.Fail("Bidding activity schedule not found for this project.");
        }

        // Update current schedule
        currentSchedule.ProcurementActivityTypeId = request.ScheduleRequest.ProcurementActivityTypeId;
        currentSchedule.StartDate = request.ScheduleRequest.StartDate;
        currentSchedule.EndDate = request.ScheduleRequest.EndDate;
        currentSchedule.Venue = request.ScheduleRequest.Venue;
        currentSchedule.Status = request.ScheduleRequest.Status;

        // Cascade update subsequent schedules
        // Sort all schedules by their starting date to process chronologically
        var sortedSchedules = projectSchedules.OrderBy(s => s.StartDate).ToList();
        var currentIndex = sortedSchedules.IndexOf(currentSchedule);

        for (int i = currentIndex + 1; i < sortedSchedules.Count; i++)
        {
            var prevSchedule = sortedSchedules[i - 1];
            var nextSchedule = sortedSchedules[i];

            // Gap of days in the original schedule
            int gap = (nextSchedule.EndDate - nextSchedule.StartDate).Days;

            // The next activity starts immediately after the previous one finishes.
            DateTime newStart = prevSchedule.EndDate;

            // And then add gap while skipping weekends to determine the new EndDate
            DateTime newEnd = AddGapWithWeekends(newStart, gap);

            nextSchedule.StartDate = newStart;
            nextSchedule.EndDate = newEnd;

            unitOfWork.BiddingActivityScheduleRepository.Update(nextSchedule);
        }

        unitOfWork.BiddingActivityScheduleRepository.Update(currentSchedule);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Bidding activity schedule updated successfully and subsequent schedules adjusted.");
    }

    private static DateTime AddGapWithWeekends(DateTime start, int gap)
    {
        DateTime end = start.Date;
        int added = 0;
        while (added < gap)
        {
            end = end.AddDays(1);
            if (end.DayOfWeek != DayOfWeek.Saturday && end.DayOfWeek != DayOfWeek.Sunday)
            {
                added++;
            }
        }
        return end;
    }
}
