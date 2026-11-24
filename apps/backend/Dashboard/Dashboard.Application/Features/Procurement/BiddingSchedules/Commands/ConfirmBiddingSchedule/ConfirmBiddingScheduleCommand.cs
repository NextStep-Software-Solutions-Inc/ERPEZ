using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.BiddingSchedules.Dtos;
using ERPEZ.Application.Features.Procurement.BiddingSchedules.Queries.GetBiddingScheduleByResolutionId;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.BiddingSchedules.Commands.ConfirmBiddingSchedule;

public record ConfirmBiddingScheduleCommand(
    Guid ScheduleId,
    string ConfirmedBy
) : IRequest<ApiResponse<BiddingScheduleResponse>>;

public class ConfirmBiddingScheduleCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<ConfirmBiddingScheduleCommand, ApiResponse<BiddingScheduleResponse>>
{
    public async Task<ApiResponse<BiddingScheduleResponse>> Handle(
        ConfirmBiddingScheduleCommand request,
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
        if (!(first.ScheduleStatus ?? "draft").Equals("draft", StringComparison.OrdinalIgnoreCase))
        {
            return ApiResponse<BiddingScheduleResponse>.Fail("Only draft schedules can be confirmed.");
        }

        var now = DateTime.UtcNow;
        foreach (var m in allMilestones)
        {
            m.ScheduleStatus = "confirmed";
            m.ConfirmedAt = now;
            m.ConfirmedBy = request.ConfirmedBy;
            unitOfWork.BiddingActivityScheduleRepository.Update(m);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        var bacResolution = await unitOfWork.BACResolutionRepository.GetByIdAsync(bacResolutionId, cancellationToken);
        var response = GetBiddingScheduleByResolutionIdQueryHandler.MapToResponse(bacResolution!, allMilestones, allMilestones[0]);
        return ApiResponse<BiddingScheduleResponse>.Success(response, "Bidding schedule confirmed successfully.");
    }
}
