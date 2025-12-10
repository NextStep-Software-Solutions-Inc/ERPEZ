using ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Commands.CreateWFPObjectiveTimeline;

public class CreateWFPObjectiveTimelineCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<CreateWFPObjectiveTimelineCommand, ApiResponse<WFPObjectiveTimelineDto>>
{
    public async Task<ApiResponse<WFPObjectiveTimelineDto>> Handle(
        CreateWFPObjectiveTimelineCommand request, 
        CancellationToken cancellationToken)
    {
        // Validate WFP Objective Target exists
        _ = await unitOfWork.WFPObjectiveTargetRepository.GetByIdAsync(request.WFPObjectiveTargetId, cancellationToken)
            ?? throw new NotFoundException("Activity not found.");

        // Check for overlapping timelines
        var existingTimelineQuery = unitOfWork.WFPObjectiveTimelineRepository.Query(
            t => t.WFPObjectiveTargetId == request.WFPObjectiveTargetId);
        var existingTimelines = await unitOfWork.WFPObjectiveTimelineRepository.ToListAsync(existingTimelineQuery, cancellationToken);

        var hasOverlap = existingTimelines.Any(t => 
            (request.StartDate >= t.StartDate && request.StartDate <= t.EndDate) ||
            (request.EndDate >= t.StartDate && request.EndDate <= t.EndDate) ||
            (request.StartDate <= t.StartDate && request.EndDate >= t.EndDate));

        if (hasOverlap)
            throw new ConflictException("Timeline period overlaps with an existing timeline for this activity.");

        var timeline = new Domain.Entities.Planning.WFPObjectiveTimeline
        {
            WFPObjectiveTargetId = request.WFPObjectiveTargetId,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            TargetValue = request.TargetValue
        };

        await unitOfWork.WFPObjectiveTimelineRepository.AddAsync(timeline, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new WFPObjectiveTimelineDto
        {
            Id = timeline.Id,
            WFPObjectiveTargetId = timeline.WFPObjectiveTargetId,
            StartDate = timeline.StartDate,
            EndDate = timeline.EndDate,
            TargetValue = timeline.TargetValue,
            CreatedAt = timeline.CreatedAt,
            CreatedBy = timeline.CreatedBy ?? string.Empty
        };

        return ApiResponse<WFPObjectiveTimelineDto>.Success(dto, "Timeline created successfully.");
    }
}
