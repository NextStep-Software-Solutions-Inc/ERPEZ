using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUAllocation.Commands.DeleteDUAllocation;

public class DeleteDUAllocationCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteDUAllocationCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteDUAllocationCommand request, CancellationToken cancellationToken)
    {
        var duAllocation = await unitOfWork.DUAllocationRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("Delivery Unit Allocation not found.");

        unitOfWork.DUAllocationRepository.Remove(duAllocation);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"Delivery Unit Allocation with ID {request.Id} deleted successfully.");
    }
}
