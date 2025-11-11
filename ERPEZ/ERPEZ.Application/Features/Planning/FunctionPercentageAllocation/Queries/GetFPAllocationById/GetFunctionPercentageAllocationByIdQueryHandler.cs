using ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Queries.GetFPAllocationById;

public class GetFunctionPercentageAllocationByIdQueryHandler(IUnitOfWork _unitOfWork) : IRequestHandler<GetFunctionPercentageAllocationByIdQuery, ApiResponse<FunctionPercentageAllocationResponse>>
{
    public async Task<ApiResponse<FunctionPercentageAllocationResponse>> Handle(GetFunctionPercentageAllocationByIdQuery request, CancellationToken cancellationToken)
    {
        var fpa = await _unitOfWork.FunctionPercentageAllocationRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");
        var res = new FunctionPercentageAllocationResponse()
        {
            Id = fpa.Id,
            FiscalYear = fpa.FiscalYear,
            FunctionType = fpa.FunctionType,
            Description = fpa.Description,
            Percentage = fpa.Percentage,
            CreatedAt = fpa.CreatedAt,
            CreatedBy = fpa.CreatedBy
        };
        return ApiResponse<FunctionPercentageAllocationResponse>.Success(res, "Retrieved successfully");
    }
}
