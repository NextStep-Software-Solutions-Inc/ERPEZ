using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUFundAllocation.Commands.DeleteDUFundAllocation;

public class DeleteDUFundAllocationCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteDUFundAllocationCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteDUFundAllocationCommand request, CancellationToken cancellationToken)
    {
        var duFundAllocation = await unitOfWork.DUFundAllocationRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("Delivery Unit Fund Allocation not found.");

        unitOfWork.DUFundAllocationRepository.Remove(duFundAllocation);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"Delivery Unit Fund Allocation with ID {request.Id} deleted successfully.");
    }
}
