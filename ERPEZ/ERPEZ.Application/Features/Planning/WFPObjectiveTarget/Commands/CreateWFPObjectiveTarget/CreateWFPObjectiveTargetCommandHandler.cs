using ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Commands.CreateWFPObjectiveTarget;

public class CreateWFPObjectiveTargetCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<CreateWFPObjectiveTargetCommand, ApiResponse<WFPObjectiveTargetResponse>>
{
    public async Task<ApiResponse<WFPObjectiveTargetResponse>> Handle(
        CreateWFPObjectiveTargetCommand request, 
        CancellationToken cancellationToken)
    {
        // Validate WFP Objective exists
        var wfpObjective = await unitOfWork.WFPObjectiveRepository.GetByIdAsync(request.WFPObjectiveId, cancellationToken)
            ?? throw new NotFoundException("Work and Financial Plan Objective not found.");

        // Check for duplicate
        var duplicate = await unitOfWork.WFPObjectiveTargetRepository.FindAsync(
            t => t.WFPObjectiveId == request.WFPObjectiveId && t.ActivityName == request.ActivityName,
            cancellationToken);
        
        if (duplicate != null)
            throw new ConflictException("Activity with the same name already exists for this objective.");

        // Get all existing targets for this objective to calculate total weight
        var existingTargetsQuery = unitOfWork.WFPObjectiveTargetRepository.Query(
            t => t.WFPObjectiveId == request.WFPObjectiveId);
        var existingTargets = await unitOfWork.WFPObjectiveTargetRepository.ToListAsync(existingTargetsQuery, cancellationToken);
        var currentTotalWeight = existingTargets.Sum(t => t.Weight);

        // Validate that adding this target won't exceed the parent objective's weight
        if (currentTotalWeight + request.Weight > wfpObjective.Weight)
        {
            var remainingWeight = wfpObjective.Weight - currentTotalWeight;
            throw new BadRequestException(
                $"Cannot add activity. Total target weight would exceed the objective weight of {wfpObjective.Weight}%. " +
                $"Remaining available weight: {remainingWeight}%.");
        }

        var target = new Domain.Entities.Planning.WFPObjectiveTarget
        {
            WFPObjectiveId = request.WFPObjectiveId,
            ActivityName = request.ActivityName,
            Indicator = request.Indicator,
            Weight = request.Weight
        };

        // Create timelines if dates are provided
        if (request.Dates != null && request.Dates.Any())
        {
            target.WFPObjectiveTimelines = request.Dates.Select(dateRange => new Domain.Entities.Planning.WFPObjectiveTimeline
            {
                StartDate = dateRange.StartDate,
                EndDate = dateRange.EndDate,
                TargetValue = 0 // Default value, can be updated later
            }).ToList();
        }

        await unitOfWork.WFPObjectiveTargetRepository.AddAsync(target, cancellationToken);
        
        // Save all changes in a single transaction
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new WFPObjectiveTargetResponse
        {
            Id = target.Id,
            WFPObjectiveId = target.WFPObjectiveId,
            ActivityName = target.ActivityName,
            Indicator = target.Indicator,
            Weight = target.Weight,
            CreatedAt = target.CreatedAt,
            CreatedBy = target.CreatedBy ?? string.Empty
        };

        return ApiResponse<WFPObjectiveTargetResponse>.Success(dto, "Activity created successfully.");
    }
}
