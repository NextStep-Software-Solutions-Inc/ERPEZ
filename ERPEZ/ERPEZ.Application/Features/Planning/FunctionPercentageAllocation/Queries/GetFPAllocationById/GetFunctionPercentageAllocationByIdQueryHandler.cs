using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Queries.GetFPAllocationById;

public class GetFunctionPercentageAllocationByIdQueryHandler(IUnitOfWork _unitOfWork) : IRequestHandler<GetFunctionPercentageAllocationByIdQuery, ApiResponse<Domain.Entities.Planning.FunctionPercentageAllocation>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.FunctionPercentageAllocation>> Handle(GetFunctionPercentageAllocationByIdQuery request, CancellationToken cancellationToken)
    {
        var fpa = await _unitOfWork.FunctionPercentageAllocationRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<Domain.Entities.Planning.FunctionPercentageAllocation>.Success(fpa, "Retrieved successfully");
    }
}
