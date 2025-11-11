using ERPEZ.Application.Features.Planning.DUAllocation.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUAllocation.Commands.CreateDUAllocation;

public class CreateDUAllocationCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateDUAllocationCommand, ApiResponse<DUAllocationDto>>
{
    public async Task<ApiResponse<DUAllocationDto>> Handle(CreateDUAllocationCommand request, CancellationToken cancellationToken)
    {
        _ = await unitOfWork.DeliveryUnitRepository.FindAsync(du => du.Id == request.DeliveryUnitId, cancellationToken) ?? throw new NotFoundException("Delivery Unit not found");
        var dUAllocation = new Domain.Entities.Planning.DUAllocation
        {
            DeliveryUnitId = request.DeliveryUnitId,
            Purpose = request.Purpose,
            Amount = request.Amount
        };
        await unitOfWork.DUAllocationRepository.AddAsync(dUAllocation, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        var dUAllocationDto = new DUAllocationDto
        {
            Id = dUAllocation.Id,
            DeliveryUnitId = dUAllocation.DeliveryUnitId,
            Purpose = dUAllocation.Purpose,
            Amount = dUAllocation.Amount
        };
        return ApiResponse<DUAllocationDto>.Success(dUAllocationDto, "Delivery Unit Allocation created successfully.");
    }
}
