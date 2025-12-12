using ERPEZ.Application.Features.Planning.ActivityBudgetRequirement.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ActivityBudgetRequirement.Commands.CreateABR;

public class CreateActivityBudgetRequirementCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateActivityBudgetRequirementCommand, ApiResponse<ActivityBudgetRequirementResponse>>
{
    public async Task<ApiResponse<ActivityBudgetRequirementResponse>> Handle(CreateActivityBudgetRequirementCommand request, CancellationToken cancellationToken)
    {
        _ = await unitOfWork.WFPObjectiveTargetRepository.GetByIdAsync(request.WFPObjectiveTargetId, cancellationToken) ?? throw new NotFoundException("WFP Objective Target not found.");
        _ = await unitOfWork.ObjectRepository.GetByIdAsync(request.ObjectId, cancellationToken) ?? throw new NotFoundException("Object not found.");
        var existingABR = await unitOfWork.ActivityBudgetRequirementRepository.FindAsync(abr =>
        abr.WFPObjectiveTargetId == request.WFPObjectiveTargetId &&
        abr.ObjectId == request.ObjectId &&
        abr.ItemDescription == request.ItemDescription,
            cancellationToken
        );

        if (existingABR != null)
            throw new ConflictException("Activity Budget Requirement already exist.");

        var abr = new Domain.Entities.Planning.ActivityBudgetRequirement
        {
            WFPObjectiveTargetId = request.WFPObjectiveTargetId,
            ObjectId = request.ObjectId,
            ItemDescription = request.ItemDescription,
            Quantity = request.Quantity,
            CostEstimates = request.CostEstimates
        };

        await unitOfWork.ActivityBudgetRequirementRepository.AddAsync(abr, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new ActivityBudgetRequirementResponse
        {
            Id = abr.Id,
            WFPObjectiveTargetId = abr.WFPObjectiveTargetId,
            Object = new()
            {
                Id = abr.Object.Id,
                ParentId = abr.Object.ParentId,
                Name = abr.Object.Name,
                Code = abr.Object.Code,
            },
            ItemDescription = abr.ItemDescription,
            Quantity = abr.Quantity,
            CostEstimates = abr.CostEstimates
        };
        return ApiResponse<ActivityBudgetRequirementResponse>.Success(dto, "Activity Budget Requirement created successfully.");
    }
}
