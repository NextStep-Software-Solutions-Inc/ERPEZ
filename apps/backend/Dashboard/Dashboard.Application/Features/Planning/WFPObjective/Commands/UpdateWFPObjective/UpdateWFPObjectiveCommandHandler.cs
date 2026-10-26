using ERPEZ.Application.Features.Planning.WFPObjective.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjective.Commands.UpdateWFPObjective;

public class UpdateWFPObjectiveCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateWFPObjectiveCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateWFPObjectiveCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateWFPObjective;
        var wfpObjective = await unitOfWork.WFPObjectiveRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("Work and Financial Plan Objective not found.");

        // Check for duplicate description if it's being changed
        if (!string.IsNullOrWhiteSpace(dto.Description) && dto.Description != wfpObjective.Description)
        {
            var duplicate = await unitOfWork.WFPObjectiveRepository.FindAsync(
                x => x.WFPId == wfpObjective.WFPId && x.Description == dto.Description && x.Id != request.Id,
                cancellationToken
            );

            if (duplicate != null)
                throw new ConflictException("Work and Financial Plan Objective with the same description already exists.");
        }

        // Validate weight if it's being changed
        if (dto.Weight.HasValue && dto.Weight.Value != wfpObjective.Weight)
        {
            // Get all existing objectives for this WFP (excluding current one)
            var existingObjectivesQuery = unitOfWork.WFPObjectiveRepository.Query(
                o => o.WFPId == wfpObjective.WFPId && o.Id != request.Id);
            var existingObjectives = await unitOfWork.WFPObjectiveRepository.ToListAsync(existingObjectivesQuery, cancellationToken);
            var otherObjectivesWeight = existingObjectives.Sum(o => o.Weight);

            // Validate that updating this objective won't exceed 100%
            if (otherObjectivesWeight + dto.Weight.Value > 100)
            {
                var remainingWeight = 100 - otherObjectivesWeight;
                throw new BadRequestException($"Cannot update objective weight. Total weight would exceed 100%. Maximum allowed weight for this objective: {remainingWeight}%.");
            }
        }

        wfpObjective.Description = dto.Description ?? wfpObjective.Description;
        wfpObjective.Weight = dto.Weight ?? wfpObjective.Weight;
        wfpObjective.Outcome = dto.Outcome ?? wfpObjective.Outcome;

        // Synchronize child activity weights when objective weight is updated
        if (dto.Weight.HasValue)
        {
            var activitiesQuery = unitOfWork.WFPObjectiveActivityRepository.Query(a => a.WFPObjectiveId == wfpObjective.Id);
            var activities = await unitOfWork.WFPObjectiveActivityRepository.ToListAsync(activitiesQuery, cancellationToken);

            if (activities.Count == 1)
            {
                // Single activity under objective: sync weight to match objective weight
                activities[0].Weight = dto.Weight.Value;
                unitOfWork.WFPObjectiveActivityRepository.Update(activities[0]);
            }
            else if (activities.Count > 1)
            {
                var totalActWeight = activities.Sum(a => a.Weight);
                if (totalActWeight > dto.Weight.Value && totalActWeight > 0)
                {
                    // Scale multiple activities proportionally to fit inside new objective weight
                    foreach (var act in activities)
                    {
                        act.Weight = Math.Round((act.Weight / totalActWeight) * dto.Weight.Value, 2);
                        unitOfWork.WFPObjectiveActivityRepository.Update(act);
                    }
                }
            }
        }

        unitOfWork.WFPObjectiveRepository.Update(wfpObjective);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Work and Financial Plan Objective updated successfully.");
    }
}
