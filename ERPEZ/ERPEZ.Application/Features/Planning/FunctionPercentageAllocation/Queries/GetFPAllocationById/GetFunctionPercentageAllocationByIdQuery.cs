using ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Queries.GetFPAllocationById;

public record GetFunctionPercentageAllocationByIdQuery(Guid Id) : IRequest<ApiResponse<FunctionPercentageAllocationResponse>>;