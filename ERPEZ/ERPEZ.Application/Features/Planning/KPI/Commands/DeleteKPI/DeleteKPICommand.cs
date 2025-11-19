using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPI.Commands.DeleteKPI;

public record class DeleteKPICommand(Guid Id) : IRequest<ApiResponse<Unit>>;
