using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.BiddingSchedules.Dtos;
using ERPEZ.Application.Features.Procurement.BiddingSchedules.Queries.GetBiddingScheduleByResolutionId;
using ERPEZ.Application.Features.Procurement.BiddingSchedules.Services;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.BiddingSchedules.Commands.UpdateBiddingMilestone;

public record UpdateBiddingMilestoneCommand(
    Guid ScheduleId,
    Guid MilestoneId,
    string OverrideDate,
    string? Time,
    string Reason,
    string EditedBy
) : IRequest<ApiResponse<BiddingScheduleResponse>>;

public class UpdateBiddingMilestoneCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateBiddingMilestoneCommand, ApiResponse<BiddingScheduleResponse>>
{
    public async Task<ApiResponse<BiddingScheduleResponse>> Handle(
        UpdateBiddingMilestoneCommand request,
        CancellationToken cancellationToken)
    {
        var targetMilestone = await unitOfWork.BiddingActivityScheduleRepository.GetByIdAsync(request.MilestoneId, cancellationToken);
        if (targetMilestone == null)
        {
            return ApiResponse<BiddingScheduleResponse>.Fail($"Milestone '{request.MilestoneId}' not found.");
        }

        if ((targetMilestone.ScheduleStatus ?? "draft").Equals("confirmed", StringComparison.OrdinalIgnoreCase) ||
            (targetMilestone.ScheduleStatus ?? "draft").Equals("locked", StringComparison.OrdinalIgnoreCase))
        {
            return ApiResponse<BiddingScheduleResponse>.Fail("Cannot edit milestones after the schedule has been confirmed or locked.");
        }

        if (!targetMilestone.BACResolutionId.HasValue)
        {
            return ApiResponse<BiddingScheduleResponse>.Fail("Milestone is not linked to a BAC Resolution.");
        }

        var bacResolutionId = targetMilestone.BACResolutionId.Value;
        var bacResolution = await unitOfWork.BACResolutionRepository.GetByIdAsync(bacResolutionId, cancellationToken);
        if (bacResolution == null)
        {
            return ApiResponse<BiddingScheduleResponse>.Fail("Associated BAC Resolution not found.");
        }

        if (!DateOnly.TryParse(request.OverrideDate, out var newDate))
        {
            return ApiResponse<BiddingScheduleResponse>.Fail("Invalid override date format. Expected YYYY-MM-DD.");
        }

        var allMilestones = (await unitOfWork.BiddingActivityScheduleRepository
            .FindAllAsync(s => s.BACResolutionId == bacResolutionId, cancellationToken))
            .OrderBy(s => s.MilestoneOrder).ToList();

        int targetIndex = allMilestones.FindIndex(m => m.Id == request.MilestoneId);
        if (targetIndex < 0)
        {
            return ApiResponse<BiddingScheduleResponse>.Fail("Milestone not found in resolution timeline.");
        }

        // Store original date before override if not already stored
        if (!targetMilestone.OriginalStartDate.HasValue)
        {
            targetMilestone.OriginalStartDate = targetMilestone.StartDate;
            targetMilestone.OriginalEndDate = targetMilestone.EndDate;
        }

        var newDateTime = DateTime.SpecifyKind(newDate.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);
        targetMilestone.StartDate = newDateTime;
        targetMilestone.EndDate = newDateTime;
        targetMilestone.AdjustmentReason = request.Reason;
        targetMilestone.AdjustedAt = DateTime.UtcNow;

        unitOfWork.BiddingActivityScheduleRepository.Update(targetMilestone);

        // Recalculate downstream milestones cascade
        var activityTypes = await unitOfWork.ProcurementActivityTypeRepository.ToListAsync(
            unitOfWork.ProcurementActivityTypeRepository.Query().Where(a => a.IsActive && !a.IsArchived), cancellationToken);

        var holidays = await unitOfWork.PublicHolidayRepository.ToListAsync(
            unitOfWork.PublicHolidayRepository.Query(), cancellationToken);

        BiddingMilestoneComputationService.RecalculateCascade(allMilestones, targetIndex, activityTypes, holidays);

        foreach (var m in allMilestones.Skip(targetIndex + 1))
        {
            unitOfWork.BiddingActivityScheduleRepository.Update(m);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        var response = GetBiddingScheduleByResolutionIdQueryHandler.MapToResponse(bacResolution, allMilestones, allMilestones[0]);
        return ApiResponse<BiddingScheduleResponse>.Success(response, "Milestone updated successfully.");
    }
}
