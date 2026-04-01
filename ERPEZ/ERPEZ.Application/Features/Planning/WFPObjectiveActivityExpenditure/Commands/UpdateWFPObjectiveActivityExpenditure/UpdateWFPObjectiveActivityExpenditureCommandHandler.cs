using ERPEZ.Application.Features.Planning.WFPObjectiveActivityExpenditure.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveActivityExpenditure.Commands.UpdateWFPObjectiveActivityExpenditure;

public class UpdateWFPObjectiveActivityExpenditureCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateWFPObjectiveActivityExpenditureCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateWFPObjectiveActivityExpenditureCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateWFPObjectiveActivityExpenditure;
        var abr = await unitOfWork.WFPObjectiveActivityExpenditureRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("WFP Objective Target Expenditure not found.");

        var duplicate = await unitOfWork.WFPObjectiveActivityExpenditureRepository.FindAsync(
            abr => abr.ItemDescription == dto.ItemDescription &&
            abr.Quantity == dto.Quantity &&
            abr.UnitCost == dto.UnitCost,
            cancellationToken
        );

        if (duplicate != null && duplicate.Id != request.Id)
            throw new ConflictException("WFP Objective Target Expenditure already exists.");

        abr.ItemDescription = dto.ItemDescription ?? abr.ItemDescription;
        abr.Quantity = dto.Quantity;
        abr.UnitCost = dto.UnitCost;

        unitOfWork.WFPObjectiveActivityExpenditureRepository.Update(abr);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "WFP Objective Target Expenditure updated successfully.");
    }
}
