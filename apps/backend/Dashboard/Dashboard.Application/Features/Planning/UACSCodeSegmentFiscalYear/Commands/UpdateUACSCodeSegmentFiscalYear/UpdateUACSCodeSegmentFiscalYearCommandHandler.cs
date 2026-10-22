using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSCodeSegmentFiscalYear.Commands.UpdateUACSCodeSegmentFiscalYear;

/// <summary>
/// Handler for updating an existing UACS code segment fiscal year association.
/// </summary>
public class UpdateUACSCodeSegmentFiscalYearCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<UpdateUACSCodeSegmentFiscalYearCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateUACSCodeSegmentFiscalYearCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.UACSCodeSegmentFiscalYearRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("UACS code segment fiscal year association not found.");

        var codeSegment = await unitOfWork.UACSCodeSegmentRepository.GetByIdAsync(request.UpdateUACSCodeSegmentFiscalYear.UACSCodeSegmentId, cancellationToken)
            ?? throw new NotFoundException("UACS code segment not found.");

        var fiscalYear = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.UpdateUACSCodeSegmentFiscalYear.FiscalYearId, cancellationToken)
            ?? throw new NotFoundException("Fiscal year not found.");

        entity.UACSCodeSegmentId = request.UpdateUACSCodeSegmentFiscalYear.UACSCodeSegmentId;
        entity.FiscalYearId = request.UpdateUACSCodeSegmentFiscalYear.FiscalYearId;
        entity.EffectiveStartDate = request.UpdateUACSCodeSegmentFiscalYear.EffectiveStartDate;
        entity.EffectiveEndDate = request.UpdateUACSCodeSegmentFiscalYear.EffectiveEndDate;
        entity.IsActive = request.UpdateUACSCodeSegmentFiscalYear.IsActive;

        unitOfWork.UACSCodeSegmentFiscalYearRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "UACS code segment fiscal year association updated successfully.");
    }
}
