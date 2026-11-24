using ERPEZ.Application.Features.Planning.User.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.User.Commands.UpdateUser;

public record UpdateUserCommand : IRequest<ApiResponse<Unit>>
{
    public required Guid Id { get; init; }
    public required UpdateUserRequest UpdateUser { get; init; }
}
