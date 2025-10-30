using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Commands.CreateFPAllocation;

public class CreateFunctionPercentageAllocationCommand : IRequest<ApiResponse<Domain.Entities.Planning.FunctionPercentageAllocation>>
{
    public string FunctionType { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Percentage { get; set; }
}
