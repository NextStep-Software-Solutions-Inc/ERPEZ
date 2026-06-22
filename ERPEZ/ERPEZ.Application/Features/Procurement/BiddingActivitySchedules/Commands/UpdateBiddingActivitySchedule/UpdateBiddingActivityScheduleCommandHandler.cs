using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.BiddingActivitySchedules.Commands.UpdateBiddingActivitySchedule;

public class UpdateBiddingActivityScheduleCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateBiddingActivityScheduleCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateBiddingActivityScheduleCommand request, CancellationToken cancellationToken)
    {
        var schedule = await unitOfWork.BiddingActivityScheduleRepository.GetByIdAsync(request.ScheduleId, cancellationToken);
        if (schedule == null || schedule.ProcurementProjectId != request.ProjectId)
        {
            return ApiResponse<Unit>.Fail("Bidding activity schedule not found for this project.");
        }

        schedule.ActivityType = request.ScheduleRequest.ActivityType;
        schedule.StartDate = request.ScheduleRequest.StartDate;
        schedule.EndDate = request.ScheduleRequest.EndDate;
        schedule.Venue = request.ScheduleRequest.Venue;

        unitOfWork.BiddingActivityScheduleRepository.Update(schedule);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Bidding activity schedule updated successfully.");
    }
}
