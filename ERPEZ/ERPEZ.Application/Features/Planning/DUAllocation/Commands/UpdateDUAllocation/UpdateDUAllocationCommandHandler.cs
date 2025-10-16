using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUAllocation.Commands.UpdateDUAllocation;

public class UpdateDUAllocationCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<UpdateDUAllocationCommand, ApiResponse<Domain.Entities.Planning.DUAllocation>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.DUAllocation>> Handle(UpdateDUAllocationCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateDUAllocation;
        var duAllocation = await _unitOfWork.DUAllocationRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("Delivery Unit Allocation not found.");
        
        duAllocation.ReceivedFundId = dto?.ReceivedFundId ?? duAllocation.ReceivedFundId;
        duAllocation.DeliveryUnitId = dto?.DeliveryUnitId ?? duAllocation.DeliveryUnitId;
        duAllocation.Purpose = dto?.Purpose ?? duAllocation.Purpose;
        duAllocation.Amount = dto?.Amount ?? duAllocation.Amount;

        _unitOfWork.DUAllocationRepository.Update(duAllocation);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Domain.Entities.Planning.DUAllocation>.Success(duAllocation, "Delivery Unit Allocation updated successfully.");
    }
}
