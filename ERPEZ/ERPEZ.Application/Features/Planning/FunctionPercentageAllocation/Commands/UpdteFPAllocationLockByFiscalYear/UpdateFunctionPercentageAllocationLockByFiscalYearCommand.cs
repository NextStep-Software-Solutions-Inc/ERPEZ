using ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Commands.UpdteFPAllocationLockByFiscalYear;

public class UpdateFunctionPercentageAllocationLockByFiscalYearCommand : IRequest<ApiResponse<string>>
{
    public List<UpdateFunctionPercentageAllocationLockByFiscalYearRequest> UpdateFunctionPercentageAllocationsRequests { get; set; } = [];
    public int FiscalYear { get; set; }
}