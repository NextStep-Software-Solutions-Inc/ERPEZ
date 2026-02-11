using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FiscalYear.Commands.UpdateFiscalYear;

public class UpdateFiscalYearCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateFiscalYearCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateFiscalYearCommand request, CancellationToken cancellationToken)
    {
        var fiscalYear = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Fiscal year not found.");

        if (fiscalYear.Status == "closed")
            throw new ForbiddenException("Cannot update a closed fiscal year.");

        if (request.Year.HasValue)
            fiscalYear.Year = request.Year.Value;
            
        if (!string.IsNullOrEmpty(request.Description))
            fiscalYear.Description = request.Description;

        unitOfWork.FiscalYearRepository.Update(fiscalYear);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Fiscal year updated successfully.");
    }
}
