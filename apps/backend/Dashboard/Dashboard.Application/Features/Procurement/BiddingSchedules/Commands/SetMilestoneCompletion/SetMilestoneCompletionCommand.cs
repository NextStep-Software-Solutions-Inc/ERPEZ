using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.BiddingSchedules.Dtos;
using ERPEZ.Application.Features.Procurement.BiddingSchedules.Queries.GetBiddingScheduleByResolutionId;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.BiddingSchedules.Commands.SetMilestoneCompletion;

public record SetMilestoneCompletionCommand(
    Guid ScheduleId,
    Guid MilestoneId,
    bool Completed,
    string UpdatedBy
) : IRequest<ApiResponse<BiddingScheduleResponse>>;

public class SetMilestoneCompletionCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<SetMilestoneCompletionCommand, ApiResponse<BiddingScheduleResponse>>
{
    public async Task<ApiResponse<BiddingScheduleResponse>> Handle(
        SetMilestoneCompletionCommand request,
        CancellationToken cancellationToken)
    {
        var targetMilestone = await unitOfWork.BiddingActivityScheduleRepository.GetByIdAsync(request.MilestoneId, cancellationToken);
        if (targetMilestone == null)
        {
            return ApiResponse<BiddingScheduleResponse>.Fail($"Milestone '{request.MilestoneId}' not found.");
        }

        if (!(targetMilestone.ScheduleStatus ?? "draft").Equals("confirmed", StringComparison.OrdinalIgnoreCase) &&
            !(targetMilestone.ScheduleStatus ?? "draft").Equals("locked", StringComparison.OrdinalIgnoreCase))
        {
            return ApiResponse<BiddingScheduleResponse>.Fail("Milestones can only be marked complete on a confirmed or locked schedule.");
        }

        targetMilestone.CompletedAt = request.Completed ? DateTime.UtcNow : null;
        targetMilestone.CompletedBy = request.Completed ? request.UpdatedBy : null;
        targetMilestone.Status = request.Completed ? "Completed" : "Pending";

        unitOfWork.BiddingActivityScheduleRepository.Update(targetMilestone);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var bacResolutionId = targetMilestone.BACResolutionId!.Value;
        var bacResolution = await unitOfWork.BACResolutionRepository.GetByIdAsync(bacResolutionId, cancellationToken);

        var allMilestones = (await unitOfWork.BiddingActivityScheduleRepository
            .FindAllAsync(s => s.BACResolutionId == bacResolutionId, cancellationToken))
            .OrderBy(s => s.MilestoneOrder).ToList();

        var response = GetBiddingScheduleByResolutionIdQueryHandler.MapToResponse(bacResolution!, allMilestones, allMilestones[0]);
        return ApiResponse<BiddingScheduleResponse>.Success(response, "Milestone completion status updated.");
    }
}
