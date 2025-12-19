using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPI.Commands.DeleteKPI;

public record DeleteKPICommand(Guid Id) : IRequest<ApiResponse<Unit>>;
