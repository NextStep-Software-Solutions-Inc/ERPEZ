using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSCodeCombination.Commands.UpdateUACSCodeCombination;

public class UpdateUACSCodeCombinationCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<UpdateUACSCodeCombinationCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateUACSCodeCombinationCommand request, CancellationToken cancellationToken)
    {
        var codeCombination = await unitOfWork.UACSCodeCombinationRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("UACS code combination not found.");

        codeCombination.FundSourceId = request.UpdateUACSCodeCombination.FundSourceId;
        codeCombination.OrganizationId = request.UpdateUACSCodeCombination.OrganizationId;
        codeCombination.LocationId = request.UpdateUACSCodeCombination.LocationId;
        codeCombination.MFOPAPId = request.UpdateUACSCodeCombination.MFOPAPId;
        codeCombination.ObjectId = request.UpdateUACSCodeCombination.ObjectId;
        codeCombination.CombinationCode = request.UpdateUACSCodeCombination.CombinationCode;
        codeCombination.Description = request.UpdateUACSCodeCombination.Description;
        codeCombination.IsValid = request.UpdateUACSCodeCombination.IsValid;
        codeCombination.FiscalYearId = request.UpdateUACSCodeCombination.FiscalYearId;
        codeCombination.EffectiveDate = request.UpdateUACSCodeCombination.EffectiveDate;
        codeCombination.ExpiryDate = request.UpdateUACSCodeCombination.ExpiryDate;
        codeCombination.IsActive = request.UpdateUACSCodeCombination.IsActive;

        unitOfWork.UACSCodeCombinationRepository.Update(codeCombination);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "UACS code combination updated successfully.");
    }
}
