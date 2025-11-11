using ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Commands.UpdateFPAllocationByFiscalYear;

public class UpdateFunctionPercentageAllocationByFiscalYearCommand : IRequest<ApiResponse<string>>
{
    public List<UpdateFunctionPercentageAllocationByFiscalYearRequest> UpdateFunctionPercentageAllocationsRequests { get; set; } = [];
    public int FiscalYear { get; set; }
}
