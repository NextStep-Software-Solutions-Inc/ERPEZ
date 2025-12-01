using ERPEZ.Application.Features.Planning.DUAllocation.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUAllocation.Queries.GetDUAllocationById;

public class GetDUAllocationByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetDUAllocationByIdQuery, ApiResponse<DUAllocationResponse>>
{
    public async Task<ApiResponse<DUAllocationResponse>> Handle(GetDUAllocationByIdQuery request, CancellationToken cancellationToken)
    {
        var duAllocation = await unitOfWork.DUAllocationRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        var dto = new DUAllocationResponse
        {
            Id = duAllocation.Id,
            DeliveryUnitId = duAllocation.DeliveryUnitId,
            Purpose = duAllocation.Purpose,
            Amount = duAllocation.Amount,
            IsLocked = duAllocation.IsLocked,
        };

        return ApiResponse<DUAllocationResponse>.Success(dto, "Retrieved successfully");
    }
}
