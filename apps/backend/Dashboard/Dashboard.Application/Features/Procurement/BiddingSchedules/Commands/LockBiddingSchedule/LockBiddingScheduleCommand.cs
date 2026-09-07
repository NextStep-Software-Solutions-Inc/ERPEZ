using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.BiddingSchedules.Dtos;
using ERPEZ.Application.Features.Procurement.BiddingSchedules.Queries.GetBiddingScheduleByResolutionId;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.BiddingSchedules.Commands.LockBiddingSchedule;

public record LockBiddingScheduleCommand(
    Guid ScheduleId,
    string LockedBy
) : IRequest<ApiResponse<BiddingScheduleResponse>>;

public class LockBiddingScheduleCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<LockBiddingScheduleCommand, ApiResponse<BiddingScheduleResponse>>
{
    public async Task<ApiResponse<BiddingScheduleResponse>> Handle(
        LockBiddingScheduleCommand request,
        CancellationToken cancellationToken)
    {
        var milestones = await unitOfWork.BiddingActivityScheduleRepository
            .FindAllAsync(s => s.BACResolutionId == request.ScheduleId || s.Id == request.ScheduleId, cancellationToken);

        if (milestones.Count == 0)
        {
            return ApiResponse<BiddingScheduleResponse>.Fail($"Schedule '{request.ScheduleId}' not found.");
        }

        var bacResolutionId = milestones[0].BACResolutionId!.Value;
        var allMilestones = (await unitOfWork.BiddingActivityScheduleRepository
            .FindAllAsync(s => s.BACResolutionId == bacResolutionId, cancellationToken))
            .OrderBy(s => s.MilestoneOrder).ToList();

        var first = allMilestones[0];
        if (!(first.ScheduleStatus ?? "draft").Equals("confirmed", StringComparison.OrdinalIgnoreCase))
        {
            return ApiResponse<BiddingScheduleResponse>.Fail("Only confirmed schedules can be locked.");
        }

        var now = DateTime.UtcNow;
        foreach (var m in allMilestones)
        {
            m.ScheduleStatus = "locked";
            m.LockedAt = now;
            m.LockedBy = request.LockedBy;
            m.IsLocked = true;
            unitOfWork.BiddingActivityScheduleRepository.Update(m);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        var bacResolution = await unitOfWork.BACResolutionRepository.GetByIdAsync(bacResolutionId, cancellationToken);
        var response = GetBiddingScheduleByResolutionIdQueryHandler.MapToResponse(bacResolution!, allMilestones, allMilestones[0]);
        return ApiResponse<BiddingScheduleResponse>.Success(response, "Bidding schedule locked successfully.");
    }
}
