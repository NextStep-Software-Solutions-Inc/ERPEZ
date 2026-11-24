using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FiscalMonth.Commands.LockFiscalMonth;

public class LockFiscalMonthCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<LockFiscalMonthCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(LockFiscalMonthCommand request, CancellationToken cancellationToken)
    {
        var fiscalMonth = await unitOfWork.FiscalMonthRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("Fiscal month not found.");

        fiscalMonth.IsLocked = true;
        // TODO: Set ModifiedByUserId when ICurrentUserService is available
        // fiscalMonth.ModifiedByUserId = currentUserService.UserId;

        unitOfWork.FiscalMonthRepository.Update(fiscalMonth);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Fiscal month locked successfully.");
    }
}
