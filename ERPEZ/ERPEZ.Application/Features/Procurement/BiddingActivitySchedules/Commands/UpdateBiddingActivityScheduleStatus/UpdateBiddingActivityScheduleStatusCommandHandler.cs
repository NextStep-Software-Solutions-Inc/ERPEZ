using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.BiddingActivitySchedules.Commands.UpdateBiddingActivityScheduleStatus;

public class UpdateBiddingActivityScheduleStatusCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateBiddingActivityScheduleStatusCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateBiddingActivityScheduleStatusCommand request, CancellationToken cancellationToken)
    {
        var schedule = await unitOfWork.BiddingActivityScheduleRepository.Query()
            .FirstOrDefaultAsync(s => s.Id == request.ScheduleId && s.ProcurementProjectId == request.ProjectId, cancellationToken);

        if (schedule == null)
        {
            return ApiResponse<Unit>.Fail("Bidding activity schedule not found for this project.");
        }

        schedule.Status = request.StatusRequest.Status;

        unitOfWork.BiddingActivityScheduleRepository.Update(schedule);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Bidding activity schedule status updated successfully.");
    }
}
