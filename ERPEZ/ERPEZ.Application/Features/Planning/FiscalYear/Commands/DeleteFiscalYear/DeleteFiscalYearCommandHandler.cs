using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FiscalYear.Commands.DeleteFiscalYear;

public class DeleteFiscalYearCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteFiscalYearCommand, ApiResponse<string>>
{
    public async Task<ApiResponse<string>> Handle(DeleteFiscalYearCommand request, CancellationToken cancellationToken)
    {
        var fiscalYear = await unitOfWork.FiscalYearRepository.GetWithAllocationsAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Fiscal year not found.");

        if (fiscalYear.IsLocked) throw new ForbiddenException("Fiscal year is locked.");

        await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            var existingQuery = unitOfWork.FunctionAllocationRepository.Query(f => f.FiscalYearId == fiscalYear.Id);
            var existing = await unitOfWork.FunctionAllocationRepository.ToListAsync(existingQuery, cancellationToken);
            if (existing.Any())
            {
                await unitOfWork.FunctionAllocationRepository.DeleteBulkAsync(existing, cancellationToken);
                await unitOfWork.SaveChangesAsync(cancellationToken);
            }

            unitOfWork.FiscalYearRepository.Remove(fiscalYear);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }, cancellationToken);

        return ApiResponse<string>.Success("Fiscal year deleted successfully.");
    }
}
