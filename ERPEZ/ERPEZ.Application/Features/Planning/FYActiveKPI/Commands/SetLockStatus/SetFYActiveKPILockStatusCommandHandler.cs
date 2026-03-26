using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FYActiveKPI.Commands.SetLockStatus;

/// <summary>
/// Locks or unlocks all FYActiveKPIs belonging to a given Fiscal Year in a single transaction.
/// When IsLocked = true  → all KPIs become immutable (targets/metadata cannot be edited).
/// When IsLocked = false → all KPIs become editable again.
/// </summary>
public class SetFYActiveKPILockStatusCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<SetFYActiveKPILockStatusCommand, ApiResponse<int>>
{
    public async Task<ApiResponse<int>> Handle(SetFYActiveKPILockStatusCommand request, CancellationToken cancellationToken)
    {
        // Validate Fiscal Year exists
        var fiscalYear = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.FiscalYearId, cancellationToken: cancellationToken)
            ?? throw new NotFoundException($"Fiscal Year with ID {request.FiscalYearId} not found.");

        // Fetch all FYActiveKPIs for the fiscal year
        var query = unitOfWork.FYActiveKPIRepository.Query(f => f.FiscalYearId == request.FiscalYearId);
        var fyActiveKPIs = await unitOfWork.FYActiveKPIRepository.ToListAsync(query, cancellationToken);

        if (fyActiveKPIs.Count == 0)
            throw new NotFoundException($"No FY Active KPIs found for Fiscal Year {fiscalYear.Year}.");

        // Validator guarantees IsLocked is not null; null-coalesce provides compile-time safety
        var isLocked = request.IsLocked ?? throw new ValidationException("IsLocked is required.");
        var updatedCount = fyActiveKPIs.Count;

        await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            foreach (var fyActiveKPI in fyActiveKPIs)
                fyActiveKPI.IsLocked = isLocked;

            await unitOfWork.FYActiveKPIRepository.UpdateBulkAsync(fyActiveKPIs, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }, cancellationToken);

        var action = isLocked ? "locked" : "unlocked";
        return ApiResponse<int>.Success(updatedCount, $"{updatedCount} KPI(s) successfully {action} for Fiscal Year {fiscalYear.Year}.");
    }
}
