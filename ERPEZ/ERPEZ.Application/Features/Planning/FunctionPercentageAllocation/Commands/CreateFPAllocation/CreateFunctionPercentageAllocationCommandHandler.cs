using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Commands.CreateFPAllocation;

public class CreateFunctionPercentageAllocationCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<CreateFunctionPercentageAllocationCommand, ApiResponse<Domain.Entities.Planning.FunctionPercentageAllocation>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.FunctionPercentageAllocation>> Handle(CreateFunctionPercentageAllocationCommand request, CancellationToken cancellationToken)
    {
        var fpaExist = await _unitOfWork.FunctionPercentageAllocationRepository.FindAsync(t => t.FunctionType == request.FunctionType, cancellationToken: cancellationToken);
        if (fpaExist != null) throw new ConflictException("Function Percentage Allocation already exists.");
        var fpa = new Domain.Entities.Planning.FunctionPercentageAllocation
        {
            FunctionType = request.FunctionType,
            Description = request.Description,
            Percentage = request.Percentage
        };
        await _unitOfWork.FunctionPercentageAllocationRepository.AddAsync(fpa, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<Domain.Entities.Planning.FunctionPercentageAllocation>.Success(fpa, "Function Percentage Allocation created successfully.");
    }
}
