using ERPEZ.Application.Features.Planning.User.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.User.Queries.GetUserById;

public record GetUserByIdQuery(Guid Id) : IRequest<ApiResponse<UserResponse>>;
