using ERPEZ.Shared.Interfaces;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace ERPEZ.Shared.Services;

public sealed class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    public string? UserId => httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
}
