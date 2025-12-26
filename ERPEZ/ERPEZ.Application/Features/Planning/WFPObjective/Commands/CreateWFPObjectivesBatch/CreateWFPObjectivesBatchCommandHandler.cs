using ERPEZ.Application.Features.Planning.WFPObjective.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjective.Commands.CreateWFPObjectivesBatch;

/// <summary>
/// Handler for creating multiple WFP Objectives in a single transaction.
/// </summary>
public class CreateWFPObjectivesBatchCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<CreateWFPObjectivesBatchCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(
        CreateWFPObjectivesBatchCommand request, 
        CancellationToken cancellationToken)
    {
        // Validate WFP exists
        _ = await unitOfWork.WFPRepository.FindAsync(wo => wo.Id == request.WFPId,
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

        // Create all objectives
        var wfpObjectives = request.WFPObjectives.Select(item => new Domain.Entities.Planning.WFPObjective
        {
            WFPId = request.WFPId,
            Description = item.Description,
            Weight = item.Weight,
            Outcome = item.Outcome
        }).ToList();

        await unitOfWork.WFPObjectiveRepository.AddRangeAsync(wfpObjectives, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(
            Unit.Value, 
            $"{wfpObjectives.Count} Work and Financial Plan Objectives created successfully.");
    }
}
