using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUAllocation.Commands.CreateDUAllocation;

public class CreateDUAllocationCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<CreateDUAllocationCommand, ApiResponse<Domain.Entities.Planning.DUAllocation>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.DUAllocation>> Handle(CreateDUAllocationCommand request, CancellationToken cancellationToken)
    {
        var receivedFundExist = await _unitOfWork.ReceivedFundRepository.FindAsync(rf => rf.Id == request.ReceivedFundId, cancellationToken) ?? throw new NotFoundException("Received Fund not found");
        var deliveryUnitExist = await _unitOfWork.DeliveryUnitRepository.FindAsync(du => du.Id == request.DeliveryUnitId, cancellationToken) ?? throw new NotFoundException("Delivery Unit not found");
        var dUAllocation = new Domain.Entities.Planning.DUAllocation
        {
            DeliveryUnitId = request.DeliveryUnitId,
            Purpose = request.Purpose,
            Amount = request.Amount
        };
        await _unitOfWork.DUAllocationRepository.AddAsync(dUAllocation, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<Domain.Entities.Planning.DUAllocation>.Success(dUAllocation, "Delivery Unit Allocation created successfully.");
    }
}
