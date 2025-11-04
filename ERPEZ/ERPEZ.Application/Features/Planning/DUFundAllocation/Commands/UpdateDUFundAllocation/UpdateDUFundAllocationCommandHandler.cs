using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUFundAllocation.Commands.UpdateDUFundAllocation;

public class UpdateDUFundAllocationCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<UpdateDUFundAllocationCommand, ApiResponse<Domain.Entities.Planning.DUFundAllocation>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.DUFundAllocation>> Handle(UpdateDUFundAllocationCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateDUFundAllocation;
        var duFundAllocation = await _unitOfWork.DUFundAllocationRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("Delivery Unit Fund Allocation not found.");

        duFundAllocation.DUAllocationId = dto?.DUAllocationId ?? duFundAllocation.DUAllocationId;
        duFundAllocation.ReceivedFundId = dto?.ReceivedFundId ?? duFundAllocation.ReceivedFundId;
        duFundAllocation.Amount = dto?.Amount ?? duFundAllocation.Amount;

        _unitOfWork.DUFundAllocationRepository.Update(duFundAllocation);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Domain.Entities.Planning.DUFundAllocation>.Success(duFundAllocation, "Delivery Unit Fund Allocation updated successfully.");
    }
}
