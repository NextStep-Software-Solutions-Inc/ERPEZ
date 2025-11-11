using ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Commands.CreateFPAllocation;

public class CreateFunctionPercentageAllocationCommand : IRequest<ApiResponse<List<FunctionPercentageAllocationResponse>>>
{
    public List<FunctionPercentageAllocationRequest> FunctionPercentageAllocationsRequests { get; set; } = [];
}
