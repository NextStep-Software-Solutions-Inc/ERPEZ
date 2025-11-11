using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using DomainFPA = ERPEZ.Domain.Entities.Planning.FunctionPercentageAllocation;

namespace ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Commands.UpdateFPAllocationByFiscalYear;

public class UpdateFunctionPercentageAllocationByFiscalYearCommandHandler(IUnitOfWork _unitOfWork)
    : IRequestHandler<UpdateFunctionPercentageAllocationByFiscalYearCommand, ApiResponse<string>>
{
    public async Task<ApiResponse<string>> Handle(UpdateFunctionPercentageAllocationByFiscalYearCommand request, CancellationToken cancellationToken)
    {
        var targetFiscalYear = request.FiscalYear;
        var updates = request.UpdateFunctionPercentageAllocationsRequests;
        var fpaRepository = _unitOfWork.FunctionPercentageAllocationRepository;

        var newPercentages = updates.ToDictionary(
            u => u.FunctionType!,
            u => u.Percentage!,
            StringComparer.OrdinalIgnoreCase
        );

        var queryForExisting = fpaRepository.Query()
            .Where(f => f.FiscalYear == targetFiscalYear);

        var allExistingAllocations = await fpaRepository.ToListAsync(queryForExisting, cancellationToken);

        var existingTypes = allExistingAllocations.Select(a => a.FunctionType).ToHashSet(StringComparer.OrdinalIgnoreCase);
        foreach (var newType in newPercentages.Keys)
        {
            if (!existingTypes.Contains(newType))
            {
                throw new NotFoundException($"Function Percentage Allocation for type '{newType}' not found in year {targetFiscalYear}.");
            }
        }

        var modifiedEntities = new List<DomainFPA>();

        var combinedTotal = allExistingAllocations.Sum(existing =>
        {
            if (newPercentages.TryGetValue(existing.FunctionType!, out var newP))
            {
                existing.Percentage = newP;
                modifiedEntities.Add(existing);

                return newP;
            }
            return existing.Percentage;
        });

        if (Math.Abs(combinedTotal - 100.0m) >= 0.001m)
        {
            throw new BadRequestException($"The combined total percentage must equal exactly 100%. Calculated total: {combinedTotal:F2}%.");
        }

        if (modifiedEntities.Count == 0)
        {
            return ApiResponse<string>.Success($"No relevant allocations were modified for Fiscal Year {targetFiscalYear}.", "Update completed.");
        }

        await fpaRepository.UpdateBulkAsync(modifiedEntities, cancellationToken);

        return ApiResponse<string>.Success(
            $"Successfully updated percentages for {modifiedEntities.Count} allocations in Fiscal Year {targetFiscalYear}.",
            "Percentage update completed."
        );
    }
}