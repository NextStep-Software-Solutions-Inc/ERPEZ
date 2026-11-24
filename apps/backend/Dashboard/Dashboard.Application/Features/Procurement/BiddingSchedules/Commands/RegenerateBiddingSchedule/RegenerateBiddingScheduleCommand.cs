using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.BiddingSchedules.Dtos;
using ERPEZ.Application.Features.Procurement.BiddingSchedules.Queries.GetBiddingScheduleByResolutionId;
using ERPEZ.Application.Features.Procurement.BiddingSchedules.Services;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.BiddingSchedules.Commands.RegenerateBiddingSchedule;

public record RegenerateBiddingScheduleCommand(
    Guid BacResolutionId,
    string IbPostingDate,
    string ProcurementCategory,
    string CreatedBy
) : IRequest<ApiResponse<BiddingScheduleResponse>>;

public class RegenerateBiddingScheduleCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<RegenerateBiddingScheduleCommand, ApiResponse<BiddingScheduleResponse>>
{
    public async Task<ApiResponse<BiddingScheduleResponse>> Handle(
        RegenerateBiddingScheduleCommand request,
        CancellationToken cancellationToken)
    {
        var bacResolution = await unitOfWork.BACResolutionRepository.GetByIdAsync(request.BacResolutionId, cancellationToken);
        if (bacResolution == null)
        {
            bacResolution = await unitOfWork.BACResolutionRepository
                .FindAsync(r => r.ProcurementProjectId == request.BacResolutionId, cancellationToken);
        }

        if (bacResolution == null)
        {
            return ApiResponse<BiddingScheduleResponse>.Fail($"BAC Resolution '{request.BacResolutionId}' not found.");
        }

        var existingSchedules = await unitOfWork.BiddingActivityScheduleRepository
            .FindAllAsync(s => s.BACResolutionId == bacResolution.Id || s.ProcurementProjectId == bacResolution.ProcurementProjectId, cancellationToken);

        if (existingSchedules.Count == 0)
        {
            return ApiResponse<BiddingScheduleResponse>.Fail($"No schedule found for resolution '{request.BacResolutionId}'.");
        }

        var first = existingSchedules[0];
        if ((first.ScheduleStatus ?? "draft").Equals("confirmed", StringComparison.OrdinalIgnoreCase) ||
            (first.ScheduleStatus ?? "draft").Equals("locked", StringComparison.OrdinalIgnoreCase))
        {
            return ApiResponse<BiddingScheduleResponse>.Fail("Only draft schedules can be regenerated. Confirmed or locked schedules are immutable.");
        }

        if (!DateOnly.TryParse(request.IbPostingDate, out var ibDate))
        {
            return ApiResponse<BiddingScheduleResponse>.Fail("Invalid IB Posting Date format.");
        }

        var category = request.ProcurementCategory.ToLowerInvariant();

        // Remove existing milestones
        unitOfWork.BiddingActivityScheduleRepository.RemoveRange(existingSchedules);

        var holidays = await unitOfWork.PublicHolidayRepository.ToListAsync(
            unitOfWork.PublicHolidayRepository.Query(), cancellationToken);

        var activityTypes = await unitOfWork.ProcurementActivityTypeRepository.ToListAsync(
            unitOfWork.ProcurementActivityTypeRepository.Query().Where(a => a.IsActive && !a.IsArchived), cancellationToken);

        var orderedActivityTypes = activityTypes.OrderBy(a => a.DisplayOrder).ToList();
        if (orderedActivityTypes.Count == 0)
        {
            return ApiResponse<BiddingScheduleResponse>.Fail("No procurement activity types found for schedule regeneration.");
        }

        var computed = BiddingMilestoneComputationService.ComputeMilestones(ibDate, orderedActivityTypes, holidays);

        var newMilestones = new List<BiddingActivitySchedule>();

        foreach (var (actType, computedDate) in computed)
        {
            var dateTime = DateTime.SpecifyKind(computedDate.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);

            var entity = new BiddingActivitySchedule
            {
                ProcurementProjectId = bacResolution.ProcurementProjectId,
                ProcurementActivityTypeId = actType.Id,
                BACResolutionId = bacResolution.Id,
                StartDate = dateTime,
                EndDate = dateTime,
                Venue = "BAC Office",
                Status = "Pending",
                Remarks = actType.Name,
                IbPostingDate = ibDate,
                ProcurementCategory = category,
                ScheduleStatus = "draft",
                MilestoneOrder = actType.DisplayOrder,
                MilestoneKey = actType.MilestoneKey ?? actType.Name,
                CreatedBy = request.CreatedBy,
                CreatedAt = DateTime.UtcNow
            };

            await unitOfWork.BiddingActivityScheduleRepository.AddAsync(entity, cancellationToken);
            newMilestones.Add(entity);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        var response = GetBiddingScheduleByResolutionIdQueryHandler.MapToResponse(bacResolution, newMilestones, newMilestones[0]);
        return ApiResponse<BiddingScheduleResponse>.Success(response, "Bidding schedule regenerated successfully.");
    }
}
