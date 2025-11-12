using ERPEZ.Application.Features.Planning.ActivityBudgetRequirement.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ActivityBudgetRequirement.Commands.UpdateABR;

public class UpdateActivityBudgetRequirementCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<UpdateActivityBudgetRequirementCommand, ApiResponse<ActivityBudgetRequirementResponse>>
{
    public async Task<ApiResponse<ActivityBudgetRequirementResponse>> Handle(UpdateActivityBudgetRequirementCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateActivityBudgetRequirement;
        var abr = await _unitOfWork.ActivityBudgetRequirementRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("Activity Budget Requirement not found.");

        var duplicate = await _unitOfWork.ActivityBudgetRequirementRepository.FindAsync(
            abr => abr.ItemDescription == dto.ItemDescription &&
            abr.Quantity == dto.Quantity &&
            abr.CostEstimates == dto.CostEstimates,
            cancellationToken
        );

        if (duplicate != null && duplicate.Id != request.Id)
            throw new ConflictException("Activity Budget Requirement already exists.");

        abr.ItemDescription = dto.ItemDescription ?? abr.ItemDescription;
        abr.Quantity = dto.Quantity;
        abr.CostEstimates = dto.CostEstimates;

        _unitOfWork.ActivityBudgetRequirementRepository.Update(abr);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var result = new ActivityBudgetRequirementResponse
        {
            Id = abr.Id,
            WFPObjectiveTargetId = abr.WFPObjectiveTargetId,
            ObjectId = abr.ObjectId,
            ItemDescription =abr.ItemDescription,
            Quantity = abr.Quantity,
            CostEstimates = abr.CostEstimates,
            CreatedAt = abr.CreatedAt,
            CreatedBy = abr.CreatedBy
        };
        return ApiResponse<ActivityBudgetRequirementResponse>.Success(result, "Activity Budget Requirement updated successfully.");
    }
}
