using ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Commands.UpdateFPAllocation;

public class UpdateFunctionPercentageAllocationCommand : IRequest<ApiResponse<Domain.Entities.Planning.FunctionPercentageAllocation>>
{
    public Guid Id { get; set; }
    public required UpdateFunctionPercentageAllocationDto UpdateFPA { get; set; }
}
