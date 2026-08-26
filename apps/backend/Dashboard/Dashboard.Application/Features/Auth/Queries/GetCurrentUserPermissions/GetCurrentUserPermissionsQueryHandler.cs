using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using ERPEZ.Shared.Interfaces;
using MediatR;

namespace ERPEZ.Application.Features.Auth.Queries.GetCurrentUserPermissions;

public class GetCurrentUserPermissionsQueryHandler(
    IUserAuthorizationService authorizationService,
    ICurrentUserService currentUser,
    ITenantContextService tenantContext)
    : IRequestHandler<GetCurrentUserPermissionsQuery, ApiResponse<IReadOnlySet<string>>>
{
    public async Task<ApiResponse<IReadOnlySet<string>>> Handle(
        GetCurrentUserPermissionsQuery request,
        CancellationToken cancellationToken)
    {
        if (currentUser.IsSuperAdmin)
        {
            var allPerms = Permissions.GetAllPermissions().ToHashSet(StringComparer.OrdinalIgnoreCase);
            return ApiResponse<IReadOnlySet<string>>.Success(allPerms);
        }

        var externalIdentityId = currentUser.ExternalIdentityId ?? string.Empty;
        var permissions = await authorizationService.GetPermissionsAsync(
            externalIdentityId,
            tenantContext.TenantId,
            cancellationToken);

        return ApiResponse<IReadOnlySet<string>>.Success(permissions);
    }
}
