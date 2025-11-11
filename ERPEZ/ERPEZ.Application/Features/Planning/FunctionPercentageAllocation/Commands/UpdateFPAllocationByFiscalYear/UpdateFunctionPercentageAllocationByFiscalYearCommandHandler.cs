using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Collections.Generic;
using System;
using DomainFPA = ERPEZ.Domain.Entities.Planning.FunctionPercentageAllocation;

namespace ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Commands.UpdateFPAllocationByFiscalYear;

public class UpdateFunctionPercentageAllocationByFiscalYearCommandHandler(IUnitOfWork _unitOfWork)
    : IRequestHandler<UpdateFunctionPercentageAllocationByFiscalYearCommand, ApiResponse<string>>
{
    public async Task<ApiResponse<string>> Handle(UpdateFunctionPercentageAllocationByFiscalYearCommand request, CancellationToken cancellationToken)
    {
        var targetFiscalYear = request.FiscalYear;
        var updates = request.UpdateFunctionPercentageAllocationsRequests;

        // --- 1. Business Logic: Pre-flight Checks (Existence and 100% Total) ---

        var newPercentages = updates.ToDictionary(
            u => u.FunctionType!,
            u => u.Percentage,
            StringComparer.OrdinalIgnoreCase
        );

        // Fetch all existing allocations for the target year
        var allExistingAllocations = await _unitOfWork.FunctionPercentageAllocationRepository.Query()
            .Where(f => f.FiscalYear == targetFiscalYear)
            .ToListAsync(cancellationToken);

        // A. Existence Check: Ensure every FunctionType to be updated already exists.
        var existingTypes = allExistingAllocations.Select(a => a.FunctionType).ToHashSet(StringComparer.OrdinalIgnoreCase);
        foreach (var newType in newPercentages.Keys)
        {
            if (!existingTypes.Contains(newType))
            {
                throw new NotFoundException($"Function Percentage Allocation for type '{newType}' not found in year {targetFiscalYear}.");
            }
        }

        // B. 100% Total Calculation and Check
        var combinedTotal = allExistingAllocations.Sum(existing =>
        {
            if (newPercentages.TryGetValue(existing.FunctionType!, out var newP))
            {
                return newP.Value;
            }
            return existing.Percentage;
        });

        // Check against 100% with tolerance
        if (Math.Abs(combinedTotal - 100.0m) >= 0.001m)
        {
            throw new BadRequestException($"The combined total percentage must equal exactly 100%. Calculated total: {combinedTotal:F2}%.");
        }

        // --- 2. Write Logic: Execute Updates ---
        int totalRowsAffected = 0;

        foreach (var update in updates)
        {
            // ExecuteUpdateAsync performs the filtered update efficiently
            var affected = await _unitOfWork.FunctionPercentageAllocationRepository.Query()
                .Where(f => f.FiscalYear == targetFiscalYear && f.FunctionType == update.FunctionType)
                .ExecuteUpdateAsync(
                    setters => setters.SetProperty(f => f.Percentage, update.Percentage),
                    cancellationToken
                );

            // This check should only trigger if a record was deleted between the read and the write
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