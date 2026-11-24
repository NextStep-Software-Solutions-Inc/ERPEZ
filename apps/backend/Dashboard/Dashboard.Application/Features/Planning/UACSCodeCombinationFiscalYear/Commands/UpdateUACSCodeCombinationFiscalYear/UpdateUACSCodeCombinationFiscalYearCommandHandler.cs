using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSCodeCombinationFiscalYear.Commands.UpdateUACSCodeCombinationFiscalYear;

/// <summary>
/// Handler for updating an existing UACS code combination fiscal year association.
/// </summary>
public class UpdateUACSCodeCombinationFiscalYearCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<UpdateUACSCodeCombinationFiscalYearCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateUACSCodeCombinationFiscalYearCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.UACSCodeCombinationFiscalYearRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("UACS code combination fiscal year association not found.");

        var codeCombination = await unitOfWork.UACSCodeCombinationRepository.GetByIdAsync(request.UpdateUACSCodeCombinationFiscalYear.UACSCodeCombinationId, cancellationToken)
            ?? throw new NotFoundException("UACS code combination not found.");

        var fiscalYear = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.UpdateUACSCodeCombinationFiscalYear.FiscalYearId, cancellationToken)
            ?? throw new NotFoundException("Fiscal year not found.");

        entity.UACSCodeCombinationId = request.UpdateUACSCodeCombinationFiscalYear.UACSCodeCombinationId;
        entity.FiscalYearId = request.UpdateUACSCodeCombinationFiscalYear.FiscalYearId;
        entity.IsValidFrom = request.UpdateUACSCodeCombinationFiscalYear.IsValidFrom;
        entity.IsValidTo = request.UpdateUACSCodeCombinationFiscalYear.IsValidTo;
        entity.IsActive = request.UpdateUACSCodeCombinationFiscalYear.IsActive;

        unitOfWork.UACSCodeCombinationFiscalYearRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "UACS code combination fiscal year association updated successfully.");
    }
}
