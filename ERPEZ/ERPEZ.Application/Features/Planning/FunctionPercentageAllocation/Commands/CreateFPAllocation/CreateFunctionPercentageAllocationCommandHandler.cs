using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
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

        var entitiesToAdd = new List<DomainFPA>();
        var functionTypesInRequest = new HashSet<string>();

        foreach (var req in allocationsToCreate)
        {
            if (!functionTypesInRequest.Add(req.FunctionType))
            {
                throw new ConflictException($"Duplicate FunctionType '{req.FunctionType}' found in the incoming request batch.");
            }
            var fpaExist = await _unitOfWork.FunctionPercentageAllocationRepository.FindAsync(
                t => t.FunctionType == req.FunctionType,
                cancellationToken: cancellationToken
            );

            if (fpaExist != null)
            {
                throw new ConflictException($"Function Percentage Allocation for type '{req.FunctionType}' already exists in the database.");
            }

            var fpa = new DomainFPA
            {
                FiscalYear = req.FiscalYear,
                FunctionType = req.FunctionType,
                Description = req.Description,
                Percentage = req.Percentage
            };
            entitiesToAdd.Add(fpa);
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