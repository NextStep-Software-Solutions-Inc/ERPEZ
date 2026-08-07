using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSCodeSegmentFiscalYear.Commands.DeleteUACSCodeSegmentFiscalYear;

/// <summary>
/// Handler for deleting a UACS code segment fiscal year association.
/// </summary>
public class DeleteUACSCodeSegmentFiscalYearCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<DeleteUACSCodeSegmentFiscalYearCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteUACSCodeSegmentFiscalYearCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.UACSCodeSegmentFiscalYearRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("UACS code segment fiscal year association not found.");

        unitOfWork.UACSCodeSegmentFiscalYearRepository.Remove(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "UACS code segment fiscal year association deleted successfully.");
    }
}
