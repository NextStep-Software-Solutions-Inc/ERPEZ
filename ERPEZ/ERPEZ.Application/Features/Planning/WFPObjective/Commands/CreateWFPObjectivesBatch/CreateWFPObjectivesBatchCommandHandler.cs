using ERPEZ.Application.Features.Planning.WFPObjective.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Interfaces;
using MediatR;

using WfpObjectiveEntity = ERPEZ.Domain.Entities.Planning.WFPObjective;
using WfpObjectiveActivityEntity = ERPEZ.Domain.Entities.Planning.WFPObjectiveActivity;
using WfpObjectiveTimelineEntity = ERPEZ.Domain.Entities.Planning.WFPObjectiveTimeline;

namespace ERPEZ.Application.Features.Planning.WFPObjective.Commands.CreateWFPObjectivesBatch;

/// <summary>
/// Handler for creating multiple WFP Objectives and nested Activities in a single transaction.
/// </summary>
public class CreateWFPObjectivesBatchCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService) 
    : IRequestHandler<CreateWFPObjectivesBatchCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(
        CreateWFPObjectivesBatchCommand request, 
        CancellationToken cancellationToken)
    {
        // Validate WFP exists
        var wfp = await unitOfWork.WFPRepository.FindAsync(wo => wo.Id == request.WFPId,
            cancellationToken) ?? throw new NotFoundException("Work and Financial Plan not found.");

        // Get all existing objectives for this WFP to calculate total weight
        var existingObjectivesQuery = unitOfWork.WFPObjectiveRepository.Query(o => o.WFPId == request.WFPId);
        var existingObjectives = await unitOfWork.WFPObjectiveRepository.ToListAsync(existingObjectivesQuery, cancellationToken);
        var currentTotalWeight = existingObjectives.Sum(o => o.Weight);

        // Calculate total weight of new objectives
        var newObjectivesTotalWeight = request.WFPObjectives.Sum(o => o.Weight);

        // Validate that adding these objectives won't exceed 100%
        if (currentTotalWeight + newObjectivesTotalWeight > 100)
        {
            var remainingWeight = 100 - currentTotalWeight;
            throw new BadRequestException(
                $"Cannot add objectives. Total weight would exceed 100%. " +
                $"Remaining available weight: {remainingWeight}%. " +
                $"Requested weight: {newObjectivesTotalWeight}%.");
        }

        // Check for duplicate descriptions
        var existingDescriptions = existingObjectives.Select(o => o.Description).ToHashSet();
        var duplicateDescriptions = request.WFPObjectives
            .Where(o => existingDescriptions.Contains(o.Description))
            .Select(o => o.Description)
            .ToList();

        if (duplicateDescriptions.Any())
        {
            throw new ConflictException(
                $"Work and Financial Plan Objectives with the following descriptions already exist: {string.Join(", ", duplicateDescriptions)}");
        }

        // Check for duplicates within the batch
        var batchDescriptions = request.WFPObjectives.Select(o => o.Description).ToList();
        var batchDuplicates = batchDescriptions
            .GroupBy(d => d)
            .Where(g => g.Count() > 1)
            .Select(g => g.Key)
            .ToList();

        if (batchDuplicates.Any())
        {
            throw new BadRequestException(
                $"Duplicate descriptions found in the batch: {string.Join(", ", batchDuplicates)}");
        }

        var year = wfp.ProjectStartDate.Year > 0 ? wfp.ProjectStartDate.Year : DateTime.UtcNow.Year;
        var createdObjectivesCount = 0;
        var currentUserId = string.IsNullOrWhiteSpace(currentUserService.UserId) ? "system" : currentUserService.UserId;
        var now = DateTime.UtcNow;

        await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            foreach (var item in request.WFPObjectives)
            {
                var wfpObjective = new WfpObjectiveEntity
                {
                    WFPId = request.WFPId,
                    Description = item.Description,
                    Weight = item.Weight,
                    Outcome = item.Outcome,
                    CreatedAt = now,
                    CreatedBy = currentUserId,
                };

                await unitOfWork.WFPObjectiveRepository.AddAsync(wfpObjective, cancellationToken);
                await unitOfWork.SaveChangesAsync(cancellationToken);
                createdObjectivesCount++;

                if (item.WFPObjectiveActivities != null && item.WFPObjectiveActivities.Count > 0)
                {
                    foreach (var act in item.WFPObjectiveActivities)
                    {
                        var wfpActivity = new WfpObjectiveActivityEntity
                        {
                            WFPId = request.WFPId,
                            WFPObjectiveId = wfpObjective.Id,
                            OPCRActivityId = act.OPCRActivityId,
                            ActivityName = string.IsNullOrWhiteSpace(act.ActivityName) ? "Activity" : act.ActivityName,
                            Indicator = string.IsNullOrWhiteSpace(act.Indicator) ? act.ActivityName : act.Indicator,
                            Weight = act.Weight,
                            CreatedAt = now,
                            CreatedBy = currentUserId,
                        };

                        await unitOfWork.WFPObjectiveActivityRepository.AddAsync(wfpActivity, cancellationToken);
                        await unitOfWork.SaveChangesAsync(cancellationToken);

                        // Auto-create Q1-Q4 quarterly timelines for each created activity
                        var timelines = new List<WfpObjectiveTimelineEntity>
                        {
                            new() { WFPObjectiveActivityId = wfpActivity.Id, TimelineType = TimelineTypeEnum.Quarterly, StartDate = new DateOnly(year, 1, 1), EndDate = new DateOnly(year, 3, 31), TargetValue = 25m, CreatedAt = now, CreatedBy = currentUserId },
                            new() { WFPObjectiveActivityId = wfpActivity.Id, TimelineType = TimelineTypeEnum.Quarterly, StartDate = new DateOnly(year, 4, 1), EndDate = new DateOnly(year, 6, 30), TargetValue = 25m, CreatedAt = now, CreatedBy = currentUserId },
                            new() { WFPObjectiveActivityId = wfpActivity.Id, TimelineType = TimelineTypeEnum.Quarterly, StartDate = new DateOnly(year, 7, 1), EndDate = new DateOnly(year, 9, 30), TargetValue = 25m, CreatedAt = now, CreatedBy = currentUserId },
                            new() { WFPObjectiveActivityId = wfpActivity.Id, TimelineType = TimelineTypeEnum.Quarterly, StartDate = new DateOnly(year, 10, 1), EndDate = new DateOnly(year, 12, 31), TargetValue = 25m, CreatedAt = now, CreatedBy = currentUserId }
                        };

                        foreach (var timeline in timelines)
                        {
                            await unitOfWork.WFPObjectiveTimelineRepository.AddAsync(timeline, cancellationToken);
                        }
                    }
                }
            }
        }, cancellationToken);

        return ApiResponse<Unit>.Success(
            Unit.Value, 
            $"{createdObjectivesCount} Work and Financial Plan Objectives & Activities created successfully.");
    }
}
