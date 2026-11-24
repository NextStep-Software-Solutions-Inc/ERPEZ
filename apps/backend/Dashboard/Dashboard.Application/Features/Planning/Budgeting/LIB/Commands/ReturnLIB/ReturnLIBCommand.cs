using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIB.Commands.ReturnLIB;

public record ReturnLIBCommand(Guid Id, string? Reason = null) : IRequest<ApiResponse<Unit>>;
