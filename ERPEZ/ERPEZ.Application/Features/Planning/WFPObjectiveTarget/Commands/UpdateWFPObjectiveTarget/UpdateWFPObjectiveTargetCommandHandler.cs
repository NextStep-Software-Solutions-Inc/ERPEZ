using ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Commands.UpdateWFPObjectiveTarget;

public class UpdateWFPObjectiveTargetCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<UpdateWFPObjectiveTargetCommand, ApiResponse<WFPObjectiveTargetDto>>
{
    public async Task<ApiResponse<WFPObjectiveTargetDto>> Handle(
        UpdateWFPObjectiveTargetCommand request, 
        CancellationToken cancellationToken)
    {
        var dto = request.UpdateWFPObjectiveTarget;

        var target = await unitOfWork.WFPObjectiveTargetRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Activity not found.");

        // Get the parent objective for weight validation
        var wfpObjective = await unitOfWork.WFPObjectiveRepository.GetByIdAsync(target.WFPObjectiveId, cancellationToken)
            ?? throw new NotFoundException("Work and Financial Plan Objective not found.");

        // Check for duplicate activity name if it's being changed
        if (!string.IsNullOrWhiteSpace(dto.ActivityName) && dto.ActivityName != target.ActivityName)
        {
            var duplicate = await unitOfWork.WFPObjectiveTargetRepository.FindAsync(
                t => t.WFPObjectiveId == target.WFPObjectiveId 
                     && t.ActivityName == dto.ActivityName 
                     && t.Id != request.Id,
                cancellationToken);

            if (duplicate != null)
                throw new ConflictException("Activity with the same name already exists for this objective.");
        }

        // Validate weight if it's being changed
        if (dto.Weight.HasValue && dto.Weight.Value != target.Weight)
        {
            // Get all existing targets for this objective (excluding current one)
            var existingTargetsQuery = unitOfWork.WFPObjectiveTargetRepository.Query(
                t => t.WFPObjectiveId == target.WFPObjectiveId && t.Id != request.Id);
            var existingTargets = await unitOfWork.WFPObjectiveTargetRepository.ToListAsync(existingTargetsQuery, cancellationToken);
            var otherTargetsWeight = existingTargets.Sum(t => t.Weight);

            // Validate that updating this target won't exceed the parent objective's weight
            if (otherTargetsWeight + dto.Weight.Value > wfpObjective.Weight)
            {
                var remainingWeight = wfpObjective.Weight - otherTargetsWeight;
                throw new BadRequestException(
                    $"Cannot update activity weight. Total target weight would exceed the objective weight of {wfpObjective.Weight}%. " +
                    $"Maximum allowed weight for this activity: {remainingWeight}%.");
            }
        }

        target.ActivityName = dto.ActivityName ?? target.ActivityName;
        target.Indicator = dto.Indicator ?? target.Indicator;
        target.Weight = dto.Weight ?? target.Weight;

        unitOfWork.WFPObjectiveTargetRepository.Update(target);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var result = new WFPObjectiveTargetDto
        {
            Id = target.Id,
            WFPObjectiveId = target.WFPObjectiveId,
            ActivityName = target.ActivityName,
            Indicator = target.Indicator,
            Weight = target.Weight,
            CreatedAt = target.CreatedAt,
            CreatedBy = target.CreatedBy ?? string.Empty
        };

        return ApiResponse<WFPObjectiveTargetDto>.Success(result, "Activity updated successfully.");
    }
}
