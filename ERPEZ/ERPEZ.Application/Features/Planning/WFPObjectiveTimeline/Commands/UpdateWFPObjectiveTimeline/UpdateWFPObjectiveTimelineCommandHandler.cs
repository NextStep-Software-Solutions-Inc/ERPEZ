using ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Commands.UpdateWFPObjectiveTimeline;

public class UpdateWFPObjectiveTimelineCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<UpdateWFPObjectiveTimelineCommand, ApiResponse<WFPObjectiveTimelineResponse>>
{
    public async Task<ApiResponse<WFPObjectiveTimelineResponse>> Handle(
        UpdateWFPObjectiveTimelineCommand request, 
        CancellationToken cancellationToken)
    {
        var dto = request.UpdateWFPObjectiveTimeline;

        var timeline = await unitOfWork.WFPObjectiveTimelineRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Timeline not found.");

        var newStartDate = dto.StartDate ?? timeline.StartDate;
        var newEndDate = dto.EndDate ?? timeline.EndDate;

        // Validate end date is after start date
        if (newEndDate <= newStartDate)
            throw new BadRequestException("End Date must be after Start Date.");

        // Check for overlapping timelines (excluding current one)
        var existingTimelineQuery = unitOfWork.WFPObjectiveTimelineRepository.Query(
            t => t.WFPObjectiveTargetId == timeline.WFPObjectiveTargetId && t.Id != request.Id);
        var existingTimelines = await unitOfWork.WFPObjectiveTimelineRepository.ToListAsync(existingTimelineQuery, cancellationToken);

        var hasOverlap = existingTimelines.Any(t => 
            (newStartDate >= t.StartDate && newStartDate <= t.EndDate) ||
            (newEndDate >= t.StartDate && newEndDate <= t.EndDate) ||
            (newStartDate <= t.StartDate && newEndDate >= t.EndDate));

        if (hasOverlap)
            throw new ConflictException("Timeline period overlaps with an existing timeline for this activity.");

        timeline.StartDate = newStartDate;
        timeline.EndDate = newEndDate;
        timeline.TargetValue = dto.TargetValue ?? timeline.TargetValue;

        unitOfWork.WFPObjectiveTimelineRepository.Update(timeline);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var result = new WFPObjectiveTimelineResponse
        {
            Id = timeline.Id,
            WFPObjectiveTargetId = timeline.WFPObjectiveTargetId,
            StartDate = timeline.StartDate,
            EndDate = timeline.EndDate,
            TargetValue = timeline.TargetValue,
            CreatedAt = timeline.CreatedAt,
            CreatedBy = timeline.CreatedBy ?? string.Empty
        };

        return ApiResponse<WFPObjectiveTimelineResponse>.Success(result, "Timeline updated successfully.");
    }
}
