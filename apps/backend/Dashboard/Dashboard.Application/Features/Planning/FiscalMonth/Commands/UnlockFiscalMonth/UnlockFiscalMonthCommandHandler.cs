using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FiscalMonth.Commands.UnlockFiscalMonth;

public class UnlockFiscalMonthCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<UnlockFiscalMonthCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UnlockFiscalMonthCommand request, CancellationToken cancellationToken)
    {
        var fiscalMonth = await unitOfWork.FiscalMonthRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("Fiscal month not found.");

        fiscalMonth.IsLocked = false;
        // TODO: Set ModifiedByUserId when ICurrentUserService is available
        // fiscalMonth.ModifiedByUserId = currentUserService.UserId;

        unitOfWork.FiscalMonthRepository.Update(fiscalMonth);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Fiscal month unlocked successfully.");
    }
}
