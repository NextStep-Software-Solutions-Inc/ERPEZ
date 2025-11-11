using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using DomainFPA = ERPEZ.Domain.Entities.Planning.FunctionPercentageAllocation;

namespace ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Commands.UpdteFPAllocationLockByFiscalYear;

public class UpdateFunctionPercentageAllocationLockByFiscalYearCommandHandler(IUnitOfWork _unitOfWork)
    : IRequestHandler<UpdateFunctionPercentageAllocationLockByFiscalYearCommand, ApiResponse<string>>
{
    public async Task<ApiResponse<string>> Handle(UpdateFunctionPercentageAllocationLockByFiscalYearCommand request, CancellationToken cancellationToken)
    {
        var targetFiscalYear = request.FiscalYear;
        var functionTypesToLock = request.UpdateFunctionPercentageAllocationsRequests
            .Select(r => r.FunctionType!)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var fpaRepository = _unitOfWork.FunctionPercentageAllocationRepository;

        var queryForExisting = fpaRepository.Query()
            .Where(f => f.FiscalYear == targetFiscalYear && functionTypesToLock.Contains(f.FunctionType));

        var existingAllocations = await fpaRepository.ToListAsync(queryForExisting, cancellationToken);

        var existingTypesInDb = existingAllocations.Select(a => a.FunctionType).ToHashSet(StringComparer.OrdinalIgnoreCase);

        foreach (var requestedType in functionTypesToLock)
        {
            if (!existingTypesInDb.Contains(requestedType))
            {
                throw new NotFoundException($"Function Percentage Allocation for type '{requestedType}' not found in year {targetFiscalYear}.");
            }
        }

        var modifiedEntities = new List<DomainFPA>();
        int alreadyLockedCount = 0;

        foreach (var existing in existingAllocations)
        {
            if (!existing.IsLocked)
            {
                existing.IsLocked = true;
                modifiedEntities.Add(existing);
            }
            else
            {
                alreadyLockedCount++;
            }
        }

        if (modifiedEntities.Count == 0)
        {
            return ApiResponse<string>.Success(
                $"No changes were applied. {alreadyLockedCount} allocations for Fiscal Year {targetFiscalYear} were already locked."
            );
        }

        await fpaRepository.UpdateBulkAsync(modifiedEntities, cancellationToken);

        return ApiResponse<string>.Success(
            $"Successfully locked {modifiedEntities.Count} allocations in Fiscal Year {targetFiscalYear}."
        );
    }
}