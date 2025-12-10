using ERPEZ.Application.Features.Planning.WFPObjective.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjective.Commands.CreateWFPObjective;

public class CreateWFPObjectiveCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateWFPObjectiveCommand, ApiResponse<WFPObjectiveDto>>
{
    public async Task<ApiResponse<WFPObjectiveDto>> Handle(CreateWFPObjectiveCommand request, CancellationToken cancellationToken)
    {
        _ = await unitOfWork.WFPRepository.FindAsync(wo => wo.Id == request.WFPId,
            cancellationToken) ?? throw new NotFoundException("Work and Financial Plan not found.");

        var duplicate = await unitOfWork.WFPObjectiveRepository.FindAsync(
            w => w.WFPId == request.WFPId && w.Description == request.Description, 
            cancellationToken);
        
        if (duplicate != null) 
            throw new ConflictException("Work and Financial Plan Objective with the same description already exists.");

        // Get all existing objectives for this WFP to calculate total weight
        var existingObjectivesQuery = unitOfWork.WFPObjectiveRepository.Query(o => o.WFPId == request.WFPId);
        var existingObjectives = await unitOfWork.WFPObjectiveRepository.ToListAsync(existingObjectivesQuery, cancellationToken);
        var currentTotalWeight = existingObjectives.Sum(o => o.Weight);

        // Validate that adding this objective won't exceed 100%
        if (currentTotalWeight + request.Weight > 100)
        {
            var remainingWeight = 100 - currentTotalWeight;
            throw new BadRequestException($"Cannot add objective. Total weight would exceed 100%. Remaining available weight: {remainingWeight}%.");
        }

        var wfpObjective = new Domain.Entities.Planning.WFPObjective
        {
            WFPId = request.WFPId,
            Description = request.Description,
            Weight = request.Weight,
            Outcome = request.Outcome
        };

        await unitOfWork.WFPObjectiveRepository.AddAsync(wfpObjective, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new WFPObjectiveDto
        {
            Id = wfpObjective.Id,
            WFPId = request.WFPId,
            Description = request.Description,
            Weight = wfpObjective.Weight,
            Outcome = wfpObjective.Outcome,
            CreatedAt = wfpObjective.CreatedAt,
            CreatedBy = wfpObjective.CreatedBy ?? string.Empty
        };
        
        return ApiResponse<WFPObjectiveDto>.Success(dto, "Work and Financial Plan Objective created successfully.");
    }
}
