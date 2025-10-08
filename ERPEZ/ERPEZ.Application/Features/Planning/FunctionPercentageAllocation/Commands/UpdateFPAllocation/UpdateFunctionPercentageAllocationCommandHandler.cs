using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Commands.UpdateFPAllocation;

public class UpdateFunctionPercentageAllocationCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<UpdateFunctionPercentageAllocationCommand, ApiResponse<Domain.Entities.Planning.FunctionPercentageAllocation>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.FunctionPercentageAllocation>> Handle(UpdateFunctionPercentageAllocationCommand request, CancellationToken cancellationToken)
    {
        var fpa = await _unitOfWork.FunctionPercentageAllocationRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("Function Percentage Allocation not found.");
        if (fpa.Name == request.UpdateFPA?.Name) throw new ConflictException("Function Percentage Allocation already exist.");

        var dto = request.UpdateFPA;
        fpa.Function = dto?.Function ?? fpa.Function;
        fpa.Percentage = dto?.Percentage ?? fpa.Percentage;
        fpa.Description = dto?.Description ?? fpa.Description;
        fpa.Name = dto?.Name ?? fpa.Name;



        _unitOfWork.FunctionPercentageAllocationRepository.Update(fpa);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Domain.Entities.Planning.FunctionPercentageAllocation>.Success(fpa, "Function Percentage Allocation updated successfully.");
    }
}
