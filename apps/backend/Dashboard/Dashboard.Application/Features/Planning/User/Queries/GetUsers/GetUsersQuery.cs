using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.User.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.User.Queries.GetUsers;

public record GetUsersQuery : PaginatedQuery<PaginatedApiResponse<UserResponse>>;
