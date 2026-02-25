using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FiscalYear.Commands.DeleteFiscalYear;

public class DeleteFiscalYearCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteFiscalYearCommand, ApiResponse<string>>
{
    public async Task<ApiResponse<string>> Handle(DeleteFiscalYearCommand request, CancellationToken cancellationToken)
    {
        var fiscalYear = await unitOfWork.FiscalYearRepository.FindAsync(f => f.Id == request.Id, cancellationToken) ?? throw new NotFoundException("Fiscal year not found.");

        if (fiscalYear.IsLocked)
            throw new ForbiddenException("Cannot delete a locked fiscal year.");

        if (fiscalYear.Status == "closed" || fiscalYear.Status == "active")
            throw new ForbiddenException("Cannot delete an active or closed fiscal year.");

        unitOfWork.FiscalYearRepository.Remove(fiscalYear);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<string>.Success("Fiscal year deleted successfully.");
    }
}
