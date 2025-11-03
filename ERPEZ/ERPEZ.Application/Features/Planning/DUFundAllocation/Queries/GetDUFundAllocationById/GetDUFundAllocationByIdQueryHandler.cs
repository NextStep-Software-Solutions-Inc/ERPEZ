using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUFundAllocation.Queries.GetDUFundAllocationById;

public class GetDUFundAllocationByIdQueryHandler(IUnitOfWork _unitOfWork) : IRequestHandler<GetDUFundAllocationByIdQuery, ApiResponse<Domain.Entities.Planning.DUFundAllocation>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.DUFundAllocation>> Handle(GetDUFundAllocationByIdQuery request, CancellationToken cancellationToken)
    {
        var duFundAllocation = await _unitOfWork.DUFundAllocationRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<Domain.Entities.Planning.DUFundAllocation>.Success(duFundAllocation, "Retrieved successfully");
    }
}
