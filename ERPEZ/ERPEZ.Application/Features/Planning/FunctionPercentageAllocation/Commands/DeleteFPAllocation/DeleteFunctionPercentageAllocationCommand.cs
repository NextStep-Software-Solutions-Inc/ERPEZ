using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Commands.DeleteFPAllocation;

public record class DeleteFunctionPercentageAllocationCommand(Guid Id) : IRequest<ApiResponse<Unit>>;