using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Commands.UpdateFPAllocationByFiscalYear;

public class UpdateFunctionPercentageAllocationByFiscalYearCommandHandler(IUnitOfWork _unitOfWork)
    : IRequestHandler<UpdateFunctionPercentageAllocationByFiscalYearCommand, ApiResponse<string>>
{
    public async Task<ApiResponse<string>> Handle(UpdateFunctionPercentageAllocationByFiscalYearCommand request, CancellationToken cancellationToken)
    {
        var targetFiscalYear = request.FiscalYear;
        var updates = request.UpdateFunctionPercentageAllocationsRequests;

        var newPercentages = updates.ToDictionary(
            u => u.FunctionType!,
            u => u.Percentage,
            StringComparer.OrdinalIgnoreCase
        );

        var allExistingAllocations = await _unitOfWork.FunctionPercentageAllocationRepository.Query()
            .Where(f => f.FiscalYear == targetFiscalYear)
            .ToListAsync(cancellationToken);

        var existingTypes = allExistingAllocations.Select(a => a.FunctionType).ToHashSet(StringComparer.OrdinalIgnoreCase);
        foreach (var newType in newPercentages.Keys)
        {
            if (!existingTypes.Contains(newType))
            {
                throw new NotFoundException($"Function Percentage Allocation for type '{newType}' not found in year {targetFiscalYear}.");
            }
        }

        var combinedTotal = allExistingAllocations.Sum(existing =>
        {
            if (newPercentages.TryGetValue(existing.FunctionType!, out var newP))
            {
                return newP;
            }
            return existing.Percentage;
        });

        if (Math.Abs(combinedTotal - 100.0m) >= 0.001m)
        {
            throw new BadRequestException($"The combined total percentage must equal exactly 100%. Calculated total: {combinedTotal:F2}%.");
        }

        int totalRowsAffected = 0;

        foreach (var update in updates)
        {
            var affected = await _unitOfWork.FunctionPercentageAllocationRepository.Query()
                .Where(f => f.FiscalYear == targetFiscalYear && f.FunctionType == update.FunctionType)
                .ExecuteUpdateAsync(
                    setters => setters.SetProperty(f => f.Percentage, update.Percentage),
                    cancellationToken
                );

            if (affected == 0)
            {
                throw new NotFoundException($"Update failed: Function Type '{update.FunctionType}' was unexpectedly not found during the write operation.");
            }
            totalRowsAffected += affected;
        }

        return ApiResponse<string>.Success(
            $"Successfully updated percentages for {totalRowsAffected} allocations in Fiscal Year {targetFiscalYear}.",
            "Percentage update completed."
        );
    }
}