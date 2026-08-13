using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveActivity.Commands.CreateWFPObjectiveActivity;

public class CreateWFPObjectiveActivityCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateWFPObjectiveActivityCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(
    CreateWFPObjectiveActivityCommand request,
    CancellationToken cancellationToken)
{
    Guid resolvedWFPId;
    Domain.Entities.Planning.WFPObjective? wfpObjective = null;

    if (request.WFPObjectiveId.HasValue)
    {
        wfpObjective = await unitOfWork.WFPObjectiveRepository
            .GetByIdAsync(request.WFPObjectiveId.Value, cancellationToken)
            ?? throw new NotFoundException("WFP Objective not found.");

        resolvedWFPId = wfpObjective.WFPId;
    }
    else
    {
        // OPCR path — WFPId must be provided in payload
        if (!request.WFPId.HasValue)
            throw new BadRequestException("WFP ID is required when no WFP Objective is specified.");

        resolvedWFPId = request.WFPId.Value;
    }

    var wfp = await unitOfWork.WFPRepository.GetByIdAsync(resolvedWFPId, cancellationToken)
        ?? throw new NotFoundException("Work and Financial Plan not found.");

    string resolvedActivityName;

    if (request.OPCRActivityId.HasValue)
    {
        if (!wfp.OPCRId.HasValue)
            throw new BadRequestException("This WFP does not have an associated OPCR.");

        var opcrActivityBelongsToOpcr = await unitOfWork.OPCRActivityRepository.FindAsync(
            a => a.Id == request.OPCRActivityId.Value && a.OPCRItem.OPCRId == wfp.OPCRId.Value,
            cancellationToken);

        if (opcrActivityBelongsToOpcr == null)
            throw new BadRequestException("The specified OPCR Activity does not belong to the OPCR associated with this WFP.");

        resolvedActivityName = opcrActivityBelongsToOpcr.Name;
    }
    else
    {
        if (string.IsNullOrWhiteSpace(request.ActivityName))
            throw new BadRequestException("Activity Name is required.");

        resolvedActivityName = request.ActivityName;
    }

    // Duplicate check
    Domain.Entities.Planning.WFPObjectiveActivity? duplicate;
    if (request.OPCRActivityId.HasValue)
    {
        duplicate = await unitOfWork.WFPObjectiveActivityRepository.FindAsync(
            t => t.WFPId == resolvedWFPId
              && t.OPCRActivityId == request.OPCRActivityId
              && t.Indicator == request.Indicator,
            cancellationToken);
    }
    else
    {
        duplicate = await unitOfWork.WFPObjectiveActivityRepository.FindAsync(
            t => t.WFPObjectiveId == request.WFPObjectiveId
              && t.ActivityName == resolvedActivityName
              && t.Indicator == request.Indicator,
            cancellationToken);
    }

    if (duplicate != null)
        throw new ConflictException("Activity with the same name already exists for this objective.");

    // Weight validation for External path
    if (wfpObjective != null)
    {
        var existingActivities = await unitOfWork.WFPObjectiveActivityRepository.ToListAsync(
            unitOfWork.WFPObjectiveActivityRepository.Query(
                t => t.WFPObjectiveId == request.WFPObjectiveId),
            cancellationToken);

        var currentTotalWeight = existingActivities.Sum(t => t.Weight);

        if (currentTotalWeight + request.Weight > wfpObjective.Weight)
        {
            var remainingWeight = wfpObjective.Weight - currentTotalWeight;
            throw new BadRequestException(
                $"Cannot add activity. Total activity weight would exceed the objective weight of {wfpObjective.Weight}%. " +
                $"Remaining available weight: {remainingWeight}%.");
        }
    }

    var activity = new Domain.Entities.Planning.WFPObjectiveActivity
    {
        WFPId          = resolvedWFPId,        // ✅ always derived correctly
        WFPObjectiveId = request.WFPObjectiveId,
        OPCRActivityId = request.OPCRActivityId,
        ActivityName   = resolvedActivityName,
        Indicator      = request.Indicator,
        Weight         = request.Weight
    };

    if (request.Dates != null && request.Dates.Any())
    {
        activity.WFPObjectiveTimelines = [.. request.Dates.Select(d =>
            new Domain.Entities.Planning.WFPObjectiveTimeline
            {
                StartDate    = d.StartDate,
                EndDate      = d.EndDate,
                TargetValue  = d.Value,
                TimelineType = Enum.Parse<TimelineTypeEnum>(d.TimelineType, ignoreCase: true)
            })];
    }
    else
    {
        var year = wfp.ProjectStartDate.Year > 0 ? wfp.ProjectStartDate.Year : DateTime.UtcNow.Year;
        activity.WFPObjectiveTimelines = new List<Domain.Entities.Planning.WFPObjectiveTimeline>
        {
            new() { StartDate = new DateOnly(year, 1, 1), EndDate = new DateOnly(year, 3, 31), TargetValue = 25m, TimelineType = TimelineTypeEnum.Quarterly },
            new() { StartDate = new DateOnly(year, 4, 1), EndDate = new DateOnly(year, 6, 30), TargetValue = 25m, TimelineType = TimelineTypeEnum.Quarterly },
            new() { StartDate = new DateOnly(year, 7, 1), EndDate = new DateOnly(year, 9, 30), TargetValue = 25m, TimelineType = TimelineTypeEnum.Quarterly },
            new() { StartDate = new DateOnly(year, 10, 1), EndDate = new DateOnly(year, 12, 31), TargetValue = 25m, TimelineType = TimelineTypeEnum.Quarterly }
        };
    }

    await unitOfWork.WFPObjectiveActivityRepository.AddAsync(activity, cancellationToken);
    await unitOfWork.SaveChangesAsync(cancellationToken);

    return ApiResponse<Guid>.Success(activity.Id, "Activity created successfully.");
    }
}