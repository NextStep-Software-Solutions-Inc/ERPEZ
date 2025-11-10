using ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Commands.UpdateFPAllocationByFiscalYear;

public class UpdateFunctionPercentageAllocationByFiscalYearCommand : IRequest<ApiResponse<List<FunctionPercentageAllocationResponse>>>
{
    public List<FunctionPercentageAllocationRequest> FunctionPercentageAllocationsRequests { get; set; } = [];
    public int FiscalYear { get; set; }
}
