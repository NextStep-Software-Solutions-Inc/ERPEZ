using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FiscalYear.Commands.UpdateFiscalYearLock;

public class UpdateFiscalYearLockCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateFiscalYearLockCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateFiscalYearLockCommand request, CancellationToken cancellationToken)
    {
        var fiscalYear = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Fiscal year not found.");

        fiscalYear.IsLocked = request.IsLocked;

        unitOfWork.FiscalYearRepository.Update(fiscalYear);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var message = request.IsLocked ? "Fiscal year locked successfully." : "Fiscal year unlocked successfully.";
        return ApiResponse<Unit>.Success(Unit.Value, message);
    }
}
