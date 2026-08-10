using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.User.Commands.DeleteUser;

public record DeleteUserCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
