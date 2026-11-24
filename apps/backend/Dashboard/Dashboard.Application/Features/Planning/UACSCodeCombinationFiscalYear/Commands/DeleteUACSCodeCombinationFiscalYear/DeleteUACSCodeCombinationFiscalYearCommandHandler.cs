using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSCodeCombinationFiscalYear.Commands.DeleteUACSCodeCombinationFiscalYear;

/// <summary>
/// Handler for deleting a UACS code combination fiscal year association.
/// </summary>
public class DeleteUACSCodeCombinationFiscalYearCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<DeleteUACSCodeCombinationFiscalYearCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteUACSCodeCombinationFiscalYearCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.UACSCodeCombinationFiscalYearRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("UACS code combination fiscal year association not found.");

        unitOfWork.UACSCodeCombinationFiscalYearRepository.Remove(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "UACS code combination fiscal year association deleted successfully.");
    }
}
