using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FiscalYear.Commands.LockFiscalYear;

public class LockFiscalYearCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<LockFiscalYearCommand, ApiResponse<string>>
{
    public async Task<ApiResponse<string>> Handle(LockFiscalYearCommand request, CancellationToken cancellationToken)
    {
        var fiscalYear = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Fiscal year not found.");

        if (fiscalYear.IsLocked)
            return ApiResponse<string>.Success("Fiscal year already locked.");

        fiscalYear.IsLocked = true;
        fiscalYear.UpdatedAt = DateTime.UtcNow;
        unitOfWork.FiscalYearRepository.Update(fiscalYear);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<string>.Success("Fiscal year locked.");
    }
}
