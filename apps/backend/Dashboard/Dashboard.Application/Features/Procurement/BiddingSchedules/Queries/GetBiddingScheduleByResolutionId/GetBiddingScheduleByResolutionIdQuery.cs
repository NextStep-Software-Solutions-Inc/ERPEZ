using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.BiddingSchedules.Dtos;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.BiddingSchedules.Queries.GetBiddingScheduleByResolutionId;

public record GetBiddingScheduleByResolutionIdQuery(Guid BacResolutionId) : IRequest<ApiResponse<BiddingScheduleResponse?>>;

public class GetBiddingScheduleByResolutionIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetBiddingScheduleByResolutionIdQuery, ApiResponse<BiddingScheduleResponse?>>
{
    public async Task<ApiResponse<BiddingScheduleResponse?>> Handle(
        GetBiddingScheduleByResolutionIdQuery request,
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
            return ApiResponse<BiddingScheduleResponse?>.Fail("BAC Resolution not found.");
        }

        var schedules = await unitOfWork.BiddingActivityScheduleRepository
            .FindAllAsync(s => s.BACResolutionId == bacResolution.Id || s.ProcurementProjectId == bacResolution.ProcurementProjectId, cancellationToken);

        var scheduleList = schedules.OrderBy(s => s.MilestoneOrder).ToList();
        if (scheduleList.Count == 0)
        {
            return ApiResponse<BiddingScheduleResponse?>.Success(null, "No schedule found for this resolution.");
        }

        var first = scheduleList[0];
        var response = MapToResponse(bacResolution, scheduleList, first);

        return ApiResponse<BiddingScheduleResponse?>.Success(response, "Bidding schedule retrieved successfully.");
    }

    public static BiddingScheduleResponse MapToResponse(
        BACResolution bacResolution,
        List<BiddingActivitySchedule> milestones,
        BiddingActivitySchedule first)
    {
        var milestoneResponses = milestones.Select(m =>
        {
            var origDateStr = m.OriginalStartDate.HasValue
                ? m.OriginalStartDate.Value.ToString("yyyy-MM-dd")
                : null;
            var startDateStr = m.StartDate.ToString("yyyy-MM-dd");

            var overrideDateStr = m.OriginalStartDate.HasValue ? startDateStr : null;
            var computedDateStr = origDateStr ?? startDateStr;

            var editHistory = new List<MilestoneEditEntryResponse>();
            if (m.OriginalStartDate.HasValue && !string.IsNullOrWhiteSpace(m.AdjustmentReason))
            {
                editHistory.Add(new MilestoneEditEntryResponse
                {
                    OriginalDate = origDateStr!,
                    NewDate = startDateStr,
                    EditedBy = m.AdjustedByUserId?.ToString() ?? "User",
                    Timestamp = m.AdjustedAt?.ToString("o") ?? m.UpdatedAt?.ToString("o") ?? DateTime.UtcNow.ToString("o"),
                    Reason = m.AdjustmentReason
                });
            }

            return new BiddingMilestoneResponse
            {
                Id = m.Id.ToString(),
                Order = m.MilestoneOrder,
                MilestoneKey = m.MilestoneKey ?? m.Id.ToString(),
                Name = m.Remarks ?? m.MilestoneKey ?? "Milestone",
                ComputedDate = computedDateStr,
                OverrideDate = overrideDateStr,
                Time = m.StartDate.TimeOfDay == TimeSpan.Zero ? null : m.StartDate.ToString("HH:mm"),
                Status = m.OriginalStartDate.HasValue ? "edited" : "auto-generated",
                IsEdited = m.OriginalStartDate.HasValue,
                CompletedAt = m.CompletedAt?.ToString("o"),
                CompletedBy = m.CompletedBy,
                EditHistory = editHistory
            };
        }).ToList();

        return new BiddingScheduleResponse
        {
            Id = bacResolution.Id.ToString(),
            BacResolutionId = bacResolution.Id.ToString(),
            BacResolutionNumber = bacResolution.ResolutionNumber,
            ProcurementCategory = first.ProcurementCategory ?? "goods",
            IbPostingDate = first.IbPostingDate?.ToString("yyyy-MM-dd") ?? first.StartDate.ToString("yyyy-MM-dd"),
            Status = (first.ScheduleStatus ?? "draft").ToLowerInvariant(),
            Milestones = milestoneResponses,
            CreatedBy = first.CreatedBy ?? "system",
            CreatedAt = first.CreatedAt.ToString("o"),
            ConfirmedAt = first.ConfirmedAt?.ToString("o"),
            ConfirmedBy = first.ConfirmedBy,
            LockedAt = first.LockedAt?.ToString("o"),
            LockedBy = first.LockedBy
        };
    }
}
