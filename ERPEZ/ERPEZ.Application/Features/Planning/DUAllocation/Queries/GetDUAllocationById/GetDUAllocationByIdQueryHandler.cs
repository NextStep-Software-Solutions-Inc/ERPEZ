using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUAllocation.Queries.GetDUAllocationById;

public class GetDUAllocationByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetDUAllocationByIdQuery, ApiResponse<Domain.Entities.Planning.DUAllocation>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.DUAllocation>> Handle(GetDUAllocationByIdQuery request, CancellationToken cancellationToken)
    {
        var duAllocation = await unitOfWork.DUAllocationRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<Domain.Entities.Planning.DUAllocation>.Success(duAllocation, "Retrieved successfully");
    }
}
