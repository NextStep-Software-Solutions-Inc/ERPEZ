using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUAllocation.Commands.UpdateDUAllocation;

public class UpdateDUAllocationCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateDUAllocationCommand, ApiResponse<Domain.Entities.Planning.DUAllocation>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.DUAllocation>> Handle(UpdateDUAllocationCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateDUAllocation;
        var duAllocation = await unitOfWork.DUAllocationRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("Delivery Unit Allocation not found.");

        duAllocation.DeliveryUnitId = dto?.DeliveryUnitId ?? duAllocation.DeliveryUnitId;
        duAllocation.Purpose = dto?.Purpose ?? duAllocation.Purpose;
        duAllocation.Amount = dto?.Amount ?? duAllocation.Amount;

        unitOfWork.DUAllocationRepository.Update(duAllocation);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Domain.Entities.Planning.DUAllocation>.Success(duAllocation, "Delivery Unit Allocation updated successfully.");
    }
}
