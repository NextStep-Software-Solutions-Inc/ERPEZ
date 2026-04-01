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
        var wfp = await unitOfWork.WFPRepository.GetByIdAsync(request.WFPId, cancellationToken)
            ?? throw new NotFoundException("Work and Financial Plan not found.");

        string resolvedActivityName;
        Domain.Entities.Planning.WFPObjective? wfpObjective = null;

        if (wfp.Mode == ModeEnum.OPCR)
        {
            // OPCR path: OPCRActivityId required, WFPObjectiveId not used
            if (!request.OPCRActivityId.HasValue)
                throw new BadRequestException("OPCR Activity ID is required when the WFP mode is OPCR.");

            if (!wfp.OPCRId.HasValue)
                throw new BadRequestException("This WFP does not have an associated OPCR.");

            // Validate OPCRActivity belongs to the WFP's OPCR via OPCRItem
            var opcrActivityBelongsToOpcr = await unitOfWork.OPCRActivityRepository.FindAsync(
                a => a.Id == request.OPCRActivityId.Value && a.OPCRItem.OPCRId == wfp.OPCRId.Value,
                cancellationToken);

            if (opcrActivityBelongsToOpcr == null)
                throw new BadRequestException("The specified OPCR Activity does not belong to the OPCR associated with this WFP.");

            // Auto-fill activity name from OPCRActivity
            resolvedActivityName = opcrActivityBelongsToOpcr.Name;
        }
        else
        {
            // External path: WFPObjectiveId required, ActivityName required
            if (!request.WFPObjectiveId.HasValue)
                throw new BadRequestException("WFP Objective ID is required when the WFP mode is External.");

            wfpObjective = await unitOfWork.WFPObjectiveRepository.GetByIdAsync(request.WFPObjectiveId.Value, cancellationToken)
                ?? throw new NotFoundException("Work and Financial Plan Objective not found.");

            if (wfpObjective.WFPId != request.WFPId)
                throw new BadRequestException("The specified WFP Objective does not belong to this WFP.");

            if (string.IsNullOrWhiteSpace(request.ActivityName))
                throw new BadRequestException("Activity Name is required when the WFP mode is External.");

            resolvedActivityName = request.ActivityName;
        }

        // Check for duplicate activity name under the same objective (or OPCR activity)
        var duplicate = await unitOfWork.WFPObjectiveActivityRepository.FindAsync(
            t => t.WFPObjectiveId == request.WFPObjectiveId
              && t.OPCRActivityId == request.OPCRActivityId
              && t.ActivityName == resolvedActivityName
              && t.Indicator == request.Indicator,
            cancellationToken);

        if (duplicate != null)
            throw new ConflictException("Activity with the same name already exists for this objective.");

        // Validate weight against parent objective only for External path
        if (wfpObjective != null)
        {
            var existingActivities = await unitOfWork.WFPObjectiveActivityRepository.ToListAsync(
                unitOfWork.WFPObjectiveActivityRepository.Query(t => t.WFPObjectiveId == request.WFPObjectiveId),
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
            WFPObjectiveId = request.WFPObjectiveId,
            OPCRActivityId = request.OPCRActivityId,
            ActivityName = resolvedActivityName,
            Indicator = request.Indicator,
            Weight = request.Weight
        };

        if (request.Dates != null && request.Dates.Any())
        {
            activity.WFPObjectiveTimelines = [.. request.Dates.Select(d => new Domain.Entities.Planning.WFPObjectiveTimeline
            {
                StartDate = d.StartDate,
                EndDate = d.EndDate,
                TargetValue = d.Value,
                TimelineType = Enum.Parse<TimelineTypeEnum>(d.TimelineType, ignoreCase: true)
            })];
        }

        await unitOfWork.WFPObjectiveActivityRepository.AddAsync(activity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(activity.Id, "Activity created successfully.");
    }
}