using MediatR;

namespace ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Commands.CreateFPAllocation;

public class CreateFunctionPercentageAllocationCommand : IRequest<Shared.Common.ApiResponse<Domain.Entities.Planning.FunctionPercentageAllocation>>
{
    public string Function { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Percentage { get; set; }
}
