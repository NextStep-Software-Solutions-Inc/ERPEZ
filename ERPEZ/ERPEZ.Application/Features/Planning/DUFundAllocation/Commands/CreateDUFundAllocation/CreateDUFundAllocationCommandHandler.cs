using ERPEZ.Application.Features.Planning.DUFundAllocation.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUFundAllocation.Commands.CreateDUFundAllocation;

public class CreateDUFundAllocationCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateDUFundAllocationCommand, ApiResponse<DUFundAllocationResponse>>
{
    public async Task<ApiResponse<DUFundAllocationResponse>> Handle(CreateDUFundAllocationCommand request, CancellationToken cancellationToken)
    {
        // Validate ReceivedFund exists and check availability
        var receivedFund = await unitOfWork.ReceivedFundRepository.GetByIdAsync(request.ReceivedFundId, cancellationToken)
            ?? throw new NotFoundException("Received Fund not found");

        // Validate DUAllocation exists
        _ = await unitOfWork.DUAllocationRepository.GetByIdAsync(request.DUAllocationId, cancellationToken)
            ?? throw new NotFoundException("Delivery Unit allocation not found");

        // Check if the received fund has enough remaining amount
        var currentAllocatedAmount = await unitOfWork.DUFundAllocationRepository.ToListAsync(
            unitOfWork.DUFundAllocationRepository.Query(alloc => alloc.ReceivedFundId == request.ReceivedFundId),
            cancellationToken);
        var totalAllocated = currentAllocatedAmount.Sum(alloc => alloc.Amount);

        if (totalAllocated + request.Amount > receivedFund.Amount)
        {
            throw new BadRequestException($"Insufficient funds in Received Fund {receivedFund.Id}. Available: {receivedFund.Amount - totalAllocated}, Requested: {request.Amount}");
        }

        var dUFundAllocation = new Domain.Entities.Planning.DUFundAllocation
        {
            DUAllocationId = request.DUAllocationId,
            ReceivedFundId = request.ReceivedFundId,
            Amount = request.Amount
        };
        await unitOfWork.DUFundAllocationRepository.AddAsync(dUFundAllocation, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        var dUFundAllocationDto = new DUFundAllocationResponse
        {
            Id = dUFundAllocation.Id,
            DUAllocationId = dUFundAllocation.DUAllocationId,
            ReceivedFundId = dUFundAllocation.ReceivedFundId,
            Amount = dUFundAllocation.Amount
        };
        return ApiResponse<DUFundAllocationResponse>.Success(dUFundAllocationDto, "Delivery Unit Fund Allocation created successfully.");
    }
}

