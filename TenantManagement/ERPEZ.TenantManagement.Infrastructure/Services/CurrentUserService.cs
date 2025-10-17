using ERPEZ.Shared.Interfaces;
using Microsoft.AspNetCore.Http;

namespace ERPEZ.TenantManagement.Infrastructure.Services;

public sealed class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;

    public string? UserId => _httpContextAccessor.HttpContext?.User?.FindFirst("sub")?.Value;
}