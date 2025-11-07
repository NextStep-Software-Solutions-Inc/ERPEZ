using ERPEZ.Application.Features.Planning.ActivityBudgetRequirement.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ActivityBudgetRequirement.Commands.CreateABR;

public class CreateActivityBudgetRequirementCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<CreateActivityBudgetRequirementCommand, ApiResponse<ActivityBudgetRequirementDto>>
{
    public async Task<ApiResponse<ActivityBudgetRequirementDto>> Handle(CreateActivityBudgetRequirementCommand request, CancellationToken cancellationToken)
    {
        var existingABR = await _unitOfWork.ActivityBudgetRequirementRepository.FindAsync(abr =>
        abr.WFPActivityId == request.WFPActivityId &&
        abr.ObjectId == request.ObjectId &&
        abr.ItemDescription == request.ItemDescription,
            cancellationToken
        );

        if (existingABR != null)
            throw new ConflictException("Activity Budget Requirement already exist.");

        var abr = new Domain.Entities.Planning.ActivityBudgetRequirement
        {
            WFPActivityId = request.WFPActivityId,
            ObjectId = request.ObjectId,
            ItemDescription = request.ItemDescription,
            Quantity = request.Quantity,
            CostEstimates = request.CostEstimates
        };

        await _unitOfWork.ActivityBudgetRequirementRepository.AddAsync(abr, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new ActivityBudgetRequirementDto
        {
            Id = abr.Id,
            WFPActivityId= abr.WFPActivityId,
            ObjectId = abr.ObjectId,
            ItemDescription = abr.ItemDescription,
            Quantity = abr.Quantity,
            CostEstimates= abr.CostEstimates
        };
        return ApiResponse<ActivityBudgetRequirementDto>.Success(dto, "Activity Budget Requirement created successfully.");
    }
}
