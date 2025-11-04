using ERPEZ.Application.Features.Planning.DUFundAllocation.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUFundAllocation.Commands.CreateDUFundAllocation;

public class CreateDUFundAllocationCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<CreateDUFundAllocationCommand, ApiResponse<DUFundAllocationDto>>
{
    public async Task<ApiResponse<DUFundAllocationDto>> Handle(CreateDUFundAllocationCommand request, CancellationToken cancellationToken)
    {
        _ = await _unitOfWork.ReceivedFundRepository.FindAsync(rf => rf.Id == request.ReceivedFundId, cancellationToken) ?? throw new NotFoundException("Received Fund not found");
        _ = await _unitOfWork.DUAllocationRepository.FindAsync(du => du.Id == request.DUAllocationId, cancellationToken) ?? throw new NotFoundException("Delivery Unit allocation not found");
        var dUFundAllocation = new Domain.Entities.Planning.DUFundAllocation
        {
            DUAllocationId = request.DUAllocationId,
            ReceivedFundId = request.ReceivedFundId,
            Amount = request.Amount
        };
        await _unitOfWork.DUFundAllocationRepository.AddAsync(dUFundAllocation, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        var dUFundAllocationDto = new DUFundAllocationDto
        {
            Id = dUFundAllocation.Id,
            DUAllocationId = dUFundAllocation.DUAllocationId,
            ReceivedFundId = dUFundAllocation.ReceivedFundId,
            Amount = dUFundAllocation.Amount
        };
        return ApiResponse<DUFundAllocationDto>.Success(dUFundAllocationDto, "Delivery Unit Fund Allocation created successfully.");
    }
}

