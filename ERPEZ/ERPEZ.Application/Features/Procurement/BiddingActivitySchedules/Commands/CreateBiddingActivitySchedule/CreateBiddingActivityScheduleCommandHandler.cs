using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.BiddingActivitySchedules.Commands.CreateBiddingActivitySchedule;

public class CreateBiddingActivityScheduleCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateBiddingActivityScheduleCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateBiddingActivityScheduleCommand request, CancellationToken cancellationToken)
    {
        var project = await unitOfWork.ProcurementProjectRepository.GetByIdAsync(request.ProjectId, cancellationToken);
        if (project == null)
        {
            return ApiResponse<Guid>.Fail("Procurement project not found.");
        }

        var activityType = await unitOfWork.ProcurementActivityTypeRepository.GetByIdAsync(request.ScheduleRequest.ProcurementActivityTypeId, cancellationToken);
        if (activityType == null)
        {
            return ApiResponse<Guid>.Fail("Procurement activity type not found.");
        }

        var schedule = new BiddingActivitySchedule
        {
            ProcurementProjectId = request.ProjectId,
            ProcurementActivityTypeId = request.ScheduleRequest.ProcurementActivityTypeId,
            StartDate = request.ScheduleRequest.StartDate,
            EndDate = request.ScheduleRequest.EndDate,
            Venue = request.ScheduleRequest.Venue,
            Status = request.ScheduleRequest.Status,
            Remarks = request.ScheduleRequest.Remarks
        };

        await unitOfWork.BiddingActivityScheduleRepository.AddAsync(schedule, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(schedule.Id, "Bidding activity schedule created successfully.");
    }
}
