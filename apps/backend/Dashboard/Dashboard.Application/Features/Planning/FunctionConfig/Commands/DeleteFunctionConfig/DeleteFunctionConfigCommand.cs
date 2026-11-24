using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FunctionConfig.Commands.DeleteFunctionConfig;

public record DeleteFunctionConfigCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
