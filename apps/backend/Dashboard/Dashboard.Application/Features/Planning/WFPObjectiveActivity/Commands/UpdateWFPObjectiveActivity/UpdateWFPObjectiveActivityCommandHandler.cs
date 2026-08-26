using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveActivity.Commands.UpdateWFPObjectiveActivity;

public class UpdateWFPObjectiveActivityCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<UpdateWFPObjectiveActivityCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(
        UpdateWFPObjectiveActivityCommand request, 
        CancellationToken cancellationToken)
    {
        var dto = request.UpdateWFPObjectiveActivity;

        var activity = await unitOfWork.WFPObjectiveActivityRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Activity not found.");

        // Check for duplicate activity name if it's being changed (External path only)
        if (!activity.OPCRActivityId.HasValue && !string.IsNullOrWhiteSpace(dto.ActivityName) && dto.ActivityName != activity.ActivityName)
        {
            var duplicate = await unitOfWork.WFPObjectiveActivityRepository.FindAsync(
                t => t.WFPObjectiveId == activity.WFPObjectiveId 
                     && t.ActivityName == dto.ActivityName
                     && t.Indicator == (dto.Indicator ?? activity.Indicator)
                     && t.Id != request.Id,
                cancellationToken);

            if (duplicate != null)
                throw new ConflictException("Activity with the same name already exists for this objective.");
        }

        // Validate weight against parent objective only for External path (WFPObjectiveId present)
        if (dto.Weight.HasValue && dto.Weight.Value != activity.Weight && activity.WFPObjectiveId.HasValue)
        {
            var wfpObjective = await unitOfWork.WFPObjectiveRepository.GetByIdAsync(activity.WFPObjectiveId.Value, cancellationToken)
                ?? throw new NotFoundException("Work and Financial Plan Objective not found.");

            var existingActivitiesQuery = unitOfWork.WFPObjectiveActivityRepository.Query(
                t => t.WFPObjectiveId == activity.WFPObjectiveId && t.Id != request.Id);
            var existingActivities = await unitOfWork.WFPObjectiveActivityRepository.ToListAsync(existingActivitiesQuery, cancellationToken);
            var otherActivitiesWeight = existingActivities.Sum(t => t.Weight);

            if (otherActivitiesWeight + dto.Weight.Value > wfpObjective.Weight)
            {
                var remainingWeight = wfpObjective.Weight - otherActivitiesWeight;
                throw new BadRequestException(
                    $"Cannot update activity weight. Total activity weight would exceed the objective weight of {wfpObjective.Weight}%. " +
                    $"Maximum allowed weight for this activity: {remainingWeight}%.");
            }
        }

        // ActivityName is auto-managed on the OPCR path; silently ignore updates for OPCR-linked activities
        if (!activity.OPCRActivityId.HasValue)
            activity.ActivityName = dto.ActivityName ?? activity.ActivityName;
        activity.Indicator = dto.Indicator ?? activity.Indicator;
        activity.Weight = dto.Weight ?? activity.Weight;

        if (dto.Dates != null && dto.Dates.Any())
        {
            var existingTimelines = await unitOfWork.WFPObjectiveTimelineRepository.ToListAsync(
                unitOfWork.WFPObjectiveTimelineRepository.Query(t => t.WFPObjectiveActivityId == activity.Id),
                cancellationToken);

            var matchedTimelineIds = new HashSet<Guid>();

            foreach (var d in dto.Dates)
            {
                var timelineType = Enum.Parse<Domain.Enums.TimelineTypeEnum>(d.TimelineType, ignoreCase: true);
                var existing = existingTimelines.FirstOrDefault(t => t.StartDate == d.StartDate);

                if (existing != null)
                {
                    existing.EndDate = d.EndDate;
                    existing.TargetValue = d.Value;
                    existing.TimelineType = timelineType;
                    unitOfWork.WFPObjectiveTimelineRepository.Update(existing);
                    matchedTimelineIds.Add(existing.Id);
                }
                else
                {
                    var timeline = new Domain.Entities.Planning.WFPObjectiveTimeline
                    {
                        WFPObjectiveActivityId = activity.Id,
                        StartDate = d.StartDate,
                        EndDate = d.EndDate,
                        TargetValue = d.Value,
                        TimelineType = timelineType
                    };
                    await unitOfWork.WFPObjectiveTimelineRepository.AddAsync(timeline, cancellationToken);
                }
            }

            var toRemove = existingTimelines.Where(t => !matchedTimelineIds.Contains(t.Id)).ToList();
            if (toRemove.Count > 0)
            {
                unitOfWork.WFPObjectiveTimelineRepository.RemoveRange(toRemove);
            }
        }

        unitOfWork.WFPObjectiveActivityRepository.Update(activity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Activity updated successfully.");
    }
}
