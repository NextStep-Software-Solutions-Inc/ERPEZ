using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Commands.UpdateFPAllocation;

public class UpdateFunctionPercentageAllocationCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateFunctionPercentageAllocationCommand, ApiResponse<Domain.Entities.Planning.FunctionPercentageAllocation>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.FunctionPercentageAllocation>> Handle(UpdateFunctionPercentageAllocationCommand request, CancellationToken cancellationToken)
    {
        var fpa = await unitOfWork.FunctionPercentageAllocationRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("Function Percentage Allocation not found.");
        if (fpa.FunctionType == request.UpdateFPA?.FunctionType) throw new ConflictException("Function Percentage Allocation already exist.");

        var dto = request.UpdateFPA;
        fpa.FiscalYear = dto?.FiscalYear ?? fpa.FiscalYear;
        fpa.FunctionType = dto?.FunctionType ?? fpa.FunctionType;
        fpa.Percentage = dto?.Percentage ?? fpa.Percentage;
        fpa.Description = dto?.Description ?? fpa.Description;



        unitOfWork.FunctionPercentageAllocationRepository.Update(fpa);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Domain.Entities.Planning.FunctionPercentageAllocation>.Success(fpa, "Function Percentage Allocation updated successfully.");
    }
}
