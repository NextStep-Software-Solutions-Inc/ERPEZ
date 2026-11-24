using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Auth.Queries.GetCurrentUserPermissions;

public record GetCurrentUserPermissionsQuery : IRequest<ApiResponse<IReadOnlySet<string>>>;
