using ERPEZ.Application.Features.Planning.FunctionConfig.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FunctionConfig.Queries.GetFunctionConfigById;

public record GetFunctionConfigByIdQuery(Guid Id) : IRequest<ApiResponse<FunctionConfigResponse>>;
