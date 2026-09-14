using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Infrastructure.Persistence.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ERPEZ.TenantManagement.Api.Controllers;

[Route("auth")]
[ApiController]
public class AuthController(IWebHostEnvironment env) : ControllerBase
{
    public const string devSigningKey = "ERPEZ_Development_Symmetric_Signing_Key_2026_Secure_Secret_12345!";
    public const string devIssuer = "https://erpez.dev/auth";
    public const string devAudience = "erpez-api";

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

        var users = DevTenantAndMemberSeeder.DevPersonas.Select(p => new
        {
            p.UserId,
            p.ExternalIdentityId,
            p.DisplayName,
            p.Email,
            TenantId = DevTenantAndMemberSeeder.DevTenantId,
            Roles = p.UserId == "dev_superadmin" ? [.. p.RoleNames, "SuperAdmin"] : p.RoleNames,
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

        var username = request?.Username ?? "dev_admin";
        var tenantId = request?.TenantId ?? DevTenantAndMemberSeeder.DevTenantId;

        var persona = DevTenantAndMemberSeeder.DevPersonas.FirstOrDefault(p =>
            p.UserId.Equals(username, StringComparison.OrdinalIgnoreCase) ||
            p.ExternalIdentityId.Equals(username, StringComparison.OrdinalIgnoreCase))
            ?? DevTenantAndMemberSeeder.DevPersonas.First(p => p.UserId == "dev_admin");

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

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(devSigningKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(7),
            Issuer = devIssuer,
            Audience = devAudience,
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
                Roles = isSuperAdmin ? [.. persona.RoleNames, "SuperAdmin"] : persona.RoleNames,
                TenantId = tenantId,
                IsSuperAdmin = isSuperAdmin
            }
        };

        return Ok(ApiResponse<object>.Success(responseData));
    }
}
