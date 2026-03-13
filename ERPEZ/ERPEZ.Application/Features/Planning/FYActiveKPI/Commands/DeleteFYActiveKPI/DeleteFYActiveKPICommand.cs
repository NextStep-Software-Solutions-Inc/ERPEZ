using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FYActiveKPI.Commands.DeleteFYActiveKPI;

public record DeleteFYActiveKPICommand(Guid Id) : IRequest<ApiResponse<Unit>>;
