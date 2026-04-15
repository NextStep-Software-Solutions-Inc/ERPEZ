using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIB.Commands.UpdateLIBStatus;

public record UpdateLIBStatusCommand(Guid Id, string Status) : IRequest<ApiResponse<Unit>>;
