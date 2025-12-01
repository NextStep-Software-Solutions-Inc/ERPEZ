using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUAllocation.Commands.LockDUAllocation;

public class LockDUAllocationCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<LockDUAllocationCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(LockDUAllocationCommand request, CancellationToken cancellationToken)
    {
        var duAllocation = await unitOfWork.DUAllocationRepository.FindAsync(da => da.Id == request.Id, cancellationToken) ?? throw new NotFoundException("DU Allocation not found");

        if (duAllocation.IsLocked)
        {
            throw new BadRequestException("DU Allocation is already locked.");
        }

        duAllocation.IsLocked = true;
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "DU Allocation locked successfully.");
    }
}