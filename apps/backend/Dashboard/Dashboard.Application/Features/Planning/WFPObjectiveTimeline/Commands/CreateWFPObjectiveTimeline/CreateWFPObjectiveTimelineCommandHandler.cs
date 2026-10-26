using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Commands.CreateWFPObjectiveTimeline;

public class CreateWFPObjectiveTimelineCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<CreateWFPObjectiveTimelineCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(
        CreateWFPObjectiveTimelineCommand request, 
        CancellationToken cancellationToken)
    {
        // Validate WFP Objective Target exists
        _ = await unitOfWork.WFPObjectiveActivityRepository.GetByIdAsync(request.WFPObjectiveActivityId, cancellationToken)
            ?? throw new NotFoundException("Activity not found.");

        // Check for overlapping timelines
        var existingTimelineQuery = unitOfWork.WFPObjectiveTimelineRepository.Query(
            t => t.WFPObjectiveActivityId == request.WFPObjectiveActivityId);
        var existingTimelines = await unitOfWork.WFPObjectiveTimelineRepository.ToListAsync(existingTimelineQuery, cancellationToken);

        var hasOverlap = existingTimelines.Any(t => 
            (request.StartDate >= t.StartDate && request.StartDate <= t.EndDate) ||
            (request.EndDate >= t.StartDate && request.EndDate <= t.EndDate) ||
            (request.StartDate <= t.StartDate && request.EndDate >= t.EndDate));

        if (hasOverlap)
            throw new ConflictException("Timeline period overlaps with an existing timeline for this activity.");

        var timeline = new Domain.Entities.Planning.WFPObjectiveTimeline
        {
            WFPObjectiveActivityId = request.WFPObjectiveActivityId,
            TimelineType = Enum.Parse<TimelineTypeEnum>(request.TimelineType),
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            TargetValue = request.TargetValue
        };

        await unitOfWork.WFPObjectiveTimelineRepository.AddAsync(timeline, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(timeline.Id, "Timeline created successfully.");
    }
}
