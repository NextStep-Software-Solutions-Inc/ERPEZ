using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSCodeCombinationFiscalYear.Commands.CreateUACSCodeCombinationFiscalYear;

/// <summary>
/// Handler for creating a new UACS code combination fiscal year association.
/// </summary>
public class CreateUACSCodeCombinationFiscalYearCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<CreateUACSCodeCombinationFiscalYearCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateUACSCodeCombinationFiscalYearCommand request, CancellationToken cancellationToken)
    {
        var codeCombination = await unitOfWork.UACSCodeCombinationRepository.GetByIdAsync(request.UACSCodeCombinationId, cancellationToken)
            ?? throw new NotFoundException("UACS code combination not found.");

        var fiscalYear = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.FiscalYearId, cancellationToken)
            ?? throw new NotFoundException("Fiscal year not found.");

        var entity = new Domain.Entities.Planning.UACSCodeCombinationFiscalYear
        {
            UACSCodeCombinationId = request.UACSCodeCombinationId,
            FiscalYearId = request.FiscalYearId,
            IsValidFrom = request.IsValidFrom,
            IsValidTo = request.IsValidTo,
            IsActive = request.IsActive
        };

        await unitOfWork.UACSCodeCombinationFiscalYearRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "UACS code combination fiscal year association created successfully.");
    }
}
