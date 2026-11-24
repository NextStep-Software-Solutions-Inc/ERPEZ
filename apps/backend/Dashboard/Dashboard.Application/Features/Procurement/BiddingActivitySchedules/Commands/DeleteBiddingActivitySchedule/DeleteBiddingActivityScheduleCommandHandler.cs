using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.BiddingActivitySchedules.Commands.DeleteBiddingActivitySchedule;

public class DeleteBiddingActivityScheduleCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteBiddingActivityScheduleCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteBiddingActivityScheduleCommand request, CancellationToken cancellationToken)
    {
        var schedule = await unitOfWork.BiddingActivityScheduleRepository.GetByIdAsync(request.ScheduleId, cancellationToken);
        if (schedule == null || schedule.ProcurementProjectId != request.ProjectId)
        {
            return ApiResponse<Unit>.Fail("Bidding activity schedule not found for this project.");
        }

        unitOfWork.BiddingActivityScheduleRepository.Remove(schedule);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Bidding activity schedule deleted successfully.");
    }
}
