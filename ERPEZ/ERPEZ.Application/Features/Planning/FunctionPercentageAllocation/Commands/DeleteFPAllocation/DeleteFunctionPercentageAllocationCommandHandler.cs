using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Commands.DeleteFPAllocation;

public class DeleteFunctionPercentageAllocationCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteFunctionPercentageAllocationCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteFunctionPercentageAllocationCommand request, CancellationToken cancellationToken)
    {
        var fpa = await unitOfWork.FunctionPercentageAllocationRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("Function Percentage Allocation not found.");

        unitOfWork.FunctionPercentageAllocationRepository.Remove(fpa);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"Function Percentage Allocation with ID {request.Id} deleted successfully.");
    }
}
