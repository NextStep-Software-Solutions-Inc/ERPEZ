using ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Commands.UpdateWFPObjectiveTargetExpenditure;

public class UpdateWFPObjectiveTargetExpenditureCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateWFPObjectiveTargetExpenditureCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateWFPObjectiveTargetExpenditureCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateWFPObjectiveTargetExpenditure;
        var abr = await unitOfWork.WFPObjectiveTargetExpenditureRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("WFP Objective Target Expenditure not found.");

        var duplicate = await unitOfWork.WFPObjectiveTargetExpenditureRepository.FindAsync(
            abr => abr.ItemDescription == dto.ItemDescription &&
            abr.Quantity == dto.Quantity &&
            abr.CostEstimates == dto.CostEstimates,
            cancellationToken
        );

        if (duplicate != null && duplicate.Id != request.Id)
            throw new ConflictException("WFP Objective Target Expenditure already exists.");

        abr.ItemDescription = dto.ItemDescription ?? abr.ItemDescription;
        abr.Quantity = dto.Quantity;
        abr.CostEstimates = dto.CostEstimates;

        unitOfWork.WFPObjectiveTargetExpenditureRepository.Update(abr);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "WFP Objective Target Expenditure updated successfully.");
    }
}
