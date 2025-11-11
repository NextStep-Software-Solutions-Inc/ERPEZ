using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using DomainFPA = ERPEZ.Domain.Entities.Planning.FunctionPercentageAllocation;
using FPAResponse = ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Dtos.FunctionPercentageAllocationResponse;

namespace ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Commands.CreateFPAllocation;

public class CreateFunctionPercentageAllocationCommandHandler(IUnitOfWork _unitOfWork)
    : IRequestHandler<CreateFunctionPercentageAllocationCommand, ApiResponse<List<FPAResponse>>>
{
    public async Task<ApiResponse<List<FPAResponse>>> Handle(CreateFunctionPercentageAllocationCommand request, CancellationToken cancellationToken)
    {
        var allocationsToCreate = request.FunctionPercentageAllocationsRequests;

        if (allocationsToCreate == null || allocationsToCreate.Count == 0)
        {
            return ApiResponse<List<FPAResponse>>.Success([], "No allocations provided for creation.");
        }

        var incomingKeys = allocationsToCreate
            .Select(req => new { req.FunctionType, req.FiscalYear })
            .ToList();

        var functionTypes = incomingKeys.Select(k => k.FunctionType).ToList();
        var fiscalYears = incomingKeys.Select(k => k.FiscalYear).Distinct().ToList();

        var fpaRepository = _unitOfWork.FunctionPercentageAllocationRepository;
        var filteredQuery = fpaRepository.Query(
            t => functionTypes.Contains(t.FunctionType) && fiscalYears.Contains(t.FiscalYear)
        );

        var existingAllocationsList = await fpaRepository.ToListAsync(filteredQuery, cancellationToken);

        var existingKeysSet = existingAllocationsList
            .Select(a => (a.FunctionType, a.FiscalYear))
            .ToHashSet();

        var dbConflictErrors = new List<string>();

        var entitiesToAdd = allocationsToCreate
            .Where(req =>
            {
                if (existingKeysSet.Contains((req.FunctionType, req.FiscalYear)))
                {
                    dbConflictErrors.Add($"Function Percentage Allocation for FunctionType '{req.FunctionType}' and FiscalYear '{req.FiscalYear}' already exists in the database.");
                    return false;
                }
                return true;
            })
            .Select(req => new DomainFPA
            {
                Id = Guid.NewGuid(),
                FiscalYear = req.FiscalYear,
                FunctionType = req.FunctionType,
                Description = req.Description,
                Percentage = req.Percentage
            })
            .ToList();

        if (dbConflictErrors.Count > 0)
        {
            var message = "One or more Function Percentage Allocations already exist in the database. Details: " + string.Join("; ", dbConflictErrors);
            return ApiResponse<List<FPAResponse>>.Fail(message);
        }

        if (entitiesToAdd.Count == 0)
        {
            return ApiResponse<List<FPAResponse>>.Success([], "No unique, non-conflicting allocations provided for creation.");
        }

        await _unitOfWork.FunctionPercentageAllocationRepository.AddBulkAsync(entitiesToAdd, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var responseDtos = entitiesToAdd.Select(entity => new FPAResponse
        {
            Id = entity.Id,
            FiscalYear = entity.FiscalYear,
            FunctionType = entity.FunctionType,
            Description = entity.Description,
            Percentage = entity.Percentage
        }).ToList();

        return ApiResponse<List<FPAResponse>>.Success(responseDtos, $"{responseDtos.Count} Function Percentage Allocations created successfully.");
    }
}