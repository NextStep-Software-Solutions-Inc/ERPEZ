using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIB.Commands.DeleteLIB;

public record DeleteLIBCommand(Guid Id) : IRequest<ApiResponse<Unit>>;




