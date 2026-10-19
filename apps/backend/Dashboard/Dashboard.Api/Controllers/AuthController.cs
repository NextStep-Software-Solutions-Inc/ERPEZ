using ERPEZ.Shared.Constants;
using ERPEZ.Shared.Authorization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ERPEZ.Api.Extensions;
using ERPEZ.Application.Features.Auth.Queries.GetCurrentUserPermissions;
using ERPEZ.Shared.Common;
using ERPEZ.Api.Configuration;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace ERPEZ.Api.Controllers;

[Route("auth")]
[ApiController]
public class AuthController(ISender mediator, IWebHostEnvironment env) : ControllerBase
{
    /// <summary>
    /// Returns the active functional permissions granted to the currently authenticated user within the active tenant.
    /// </summary>
    [Authorize]
    [HttpGet("me/permissions")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlySet<string>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMyPermissions()
    {
        var result = await mediator.Send(new GetCurrentUserPermissionsQuery());
        return Ok(result);
    }

    /// <summary>
    /// Returns the list of pre-seeded dev test personas for local testing.
    /// </summary>
    [AllowAnonymous]
    [HttpGet("dev/users")]
    public IActionResult GetDevUsers()
    {
        if (!env.IsDevelopment())
        {
            return NotFound();
        }

        var users = AmsDevPersonas.DevPersonas.Select(p => new
        {
            p.UserId,
            p.ExternalIdentityId,
            p.DisplayName,
            p.Email,
            TenantId = AmsDevPersonas.DevTenantId,
            Roles = p.RoleNames,
            IsSuperAdmin = p.UserId == "dev_superadmin"
        });

        return Ok(ApiResponse<object>.Success(users));
    }

    public record DevLoginRequest(string? Username, Guid? TenantId);

    /// <summary>
    /// Generates a signed development JWT for a selected persona to test RBAC workflows locally.
    /// </summary>
    [AllowAnonymous]
    [HttpPost("dev/login")]
    public IActionResult DevLogin([FromBody] DevLoginRequest? request)
    {
        if (!env.IsDevelopment())
        {
            return NotFound();
        }

        var username = request?.Username ?? "dev_planner";
        var tenantId = request?.TenantId ?? AmsDevPersonas.DevTenantId;

        var persona = AmsDevPersonas.DevPersonas.FirstOrDefault(p =>
            p.UserId.Equals(username, StringComparison.OrdinalIgnoreCase) ||
            p.ExternalIdentityId.Equals(username, StringComparison.OrdinalIgnoreCase))
            ?? AmsDevPersonas.DevPersonas.First(p => p.UserId == "dev_planner");

        var isSuperAdmin = persona.UserId == "dev_superadmin";

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, persona.ExternalIdentityId),
            new("sub", persona.ExternalIdentityId),
            new("tenant_id", tenantId.ToString()),
            new("tenantId", tenantId.ToString()),
            new("preferred_username", persona.UserId),
            new("name", persona.DisplayName),
            new(ClaimTypes.Name, persona.DisplayName),
            new(ClaimTypes.Email, persona.Email),
            new("email", persona.Email),
            new("is_super_admin", isSuperAdmin.ToString().ToLowerInvariant())
        };

        foreach (var role in persona.RoleNames)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
            claims.Add(new Claim("role", role));
        }

        if (isSuperAdmin)
        {
            claims.Add(new Claim(ClaimTypes.Role, "SuperAdmin"));
            claims.Add(new Claim("role", "SuperAdmin"));
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(AuthenticationExtensions.devSigningKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(7),
            Issuer = AuthenticationExtensions.devIssuer,
            Audience = AuthenticationExtensions.devAudience,
            SigningCredentials = credentials
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        var tokenString = tokenHandler.WriteToken(token);

        var responseData = new
        {
            Token = tokenString,
            User = new
            {
                persona.UserId,
                persona.ExternalIdentityId,
                persona.DisplayName,
                persona.Email,
                Roles = persona.RoleNames,
                TenantId = tenantId,
                IsSuperAdmin = isSuperAdmin
            }
        };

        return Ok(ApiResponse<object>.Success(responseData));
    }
}
