using ERPEZ.Shared.Common;
using ERPEZ.Shared.Enums;
using ERPEZ.TenantManagement.Application.Common.Interfaces;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Domain.Interfaces;
using ERPEZ.TenantManagement.Infrastructure.Persistence.Repositories;
using Hangfire;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ERPEZ.TenantManagement.Api.Controllers;

[Route("auth")]
[ApiController]
public class AuthController(
    IWebHostEnvironment env,
    IUnitOfWork unitOfWork,
    IConfiguration configuration,
    IHttpClientFactory httpClientFactory,
    ILogger<AuthController> logger,
    IBackgroundJobClient? backgroundJobClient = null) : ControllerBase
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

    public record LoginRequest(string? UsernameOrEmail, string? Password, bool RememberMe = false);

    /// <summary>
    /// Authenticates a user in-app via Keycloak Direct Access Grant (ROPC) or dev persona fallback.
    /// Returns bearer token and user/tenant profile.
    /// </summary>
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest? request, CancellationToken cancellationToken)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.UsernameOrEmail) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(ApiResponse<object>.Fail("Username or email and password are required."));
        }

        var usernameOrEmail = request.UsernameOrEmail.Trim();
        var password = request.Password;

        // 1. Try Keycloak Direct Access Grant (ROPC flow)
        var keycloakAuthResult = await TryKeycloakDirectLoginAsync(usernameOrEmail, password, cancellationToken);
        if (keycloakAuthResult != null)
        {
            return Ok(ApiResponse<object>.Success(keycloakAuthResult, "Authentication successful."));
        }

        // 2. Dev Persona & Local Fallback (for offline testing or seeded dev personas)
        var devPersona = DevTenantAndMemberSeeder.DevPersonas.FirstOrDefault(p =>
            p.UserId.Equals(usernameOrEmail, StringComparison.OrdinalIgnoreCase) ||
            p.Email.Equals(usernameOrEmail, StringComparison.OrdinalIgnoreCase) ||
            p.DisplayName.Equals(usernameOrEmail, StringComparison.OrdinalIgnoreCase));

        // In development or when testing, dev personas accept any password or common dev password
        if (devPersona != null)
        {
            var isSuperAdmin = devPersona.UserId == "dev_superadmin";
            var tenantId = DevTenantAndMemberSeeder.DevTenantId;

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, devPersona.ExternalIdentityId),
                new("sub", devPersona.ExternalIdentityId),
                new("tenant_id", tenantId.ToString()),
                new("tenantId", tenantId.ToString()),
                new("preferred_username", devPersona.UserId),
                new("name", devPersona.DisplayName),
                new(ClaimTypes.Name, devPersona.DisplayName),
                new(ClaimTypes.Email, devPersona.Email),
                new("email", devPersona.Email),
                new("is_super_admin", isSuperAdmin.ToString().ToLowerInvariant())
            };

            foreach (var role in devPersona.RoleNames)
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
                Expires = DateTime.UtcNow.AddDays(request.RememberMe ? 30 : 7),
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
                RefreshToken = (string?)null,
                User = new
                {
                    devPersona.UserId,
                    devPersona.ExternalIdentityId,
                    devPersona.DisplayName,
                    devPersona.Email,
                    Roles = isSuperAdmin ? [.. devPersona.RoleNames, "SuperAdmin"] : devPersona.RoleNames,
                    TenantId = tenantId,
                    IsSuperAdmin = isSuperAdmin
                }
            };

            return Ok(ApiResponse<object>.Success(responseData, "Authentication successful."));
        }

        // 3. Control DB registered member fallback
        var member = await unitOfWork.TenantMemberRepository.FindAsync(m =>
            m.Email.ToLower() == usernameOrEmail.ToLower() ||
            m.UserId.ToLower() == usernameOrEmail.ToLower(), cancellationToken);

        if (member != null)
        {
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, member.ExternalIdentityId),
                new("sub", member.ExternalIdentityId),
                new("tenant_id", member.TenantId.ToString()),
                new("tenantId", member.TenantId.ToString()),
                new("preferred_username", member.UserId),
                new("name", $"{member.FirstName} {member.LastName}".Trim()),
                new(ClaimTypes.Name, $"{member.FirstName} {member.LastName}".Trim()),
                new(ClaimTypes.Email, member.Email),
                new("email", member.Email),
                new("is_super_admin", "false"),
                new(ClaimTypes.Role, "Tenant Administrator"),
                new("role", "Tenant Administrator")
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(devSigningKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(request.RememberMe ? 30 : 7),
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
                RefreshToken = (string?)null,
                User = new
                {
                    UserId = member.UserId,
                    ExternalIdentityId = member.ExternalIdentityId,
                    DisplayName = $"{member.FirstName} {member.LastName}".Trim(),
                    Email = member.Email,
                    Roles = new[] { "Tenant Administrator" },
                    TenantId = member.TenantId,
                    IsSuperAdmin = false
                }
            };

            return Ok(ApiResponse<object>.Success(responseData, "Authentication successful."));
        }

        return Unauthorized(ApiResponse<object>.Fail("Invalid username or password."));
    }

    public record RegisterRequest(
        string? Username,
        string? Email,
        string? Password,
        string? FirstName,
        string? LastName,
        string? OrganizationName
    );

    /// <summary>
    /// Registers a new user account, creates an initial organization workspace, and generates a session JWT.
    /// </summary>
    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest? request, CancellationToken cancellationToken)
    {
        if (request == null)
        {
            return BadRequest(ApiResponse<object>.Fail("Registration data is required."));
        }

        if (string.IsNullOrWhiteSpace(request.Username))
        {
            return BadRequest(ApiResponse<object>.Fail("Username is required."));
        }

        if (string.IsNullOrWhiteSpace(request.Email) || !request.Email.Contains('@'))
        {
            return BadRequest(ApiResponse<object>.Fail("A valid email address is required."));
        }

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 8)
        {
            return BadRequest(ApiResponse<object>.Fail("Password must be at least 8 characters."));
        }

        var firstName = string.IsNullOrWhiteSpace(request.FirstName) ? "Admin" : request.FirstName.Trim();
        var lastName = string.IsNullOrWhiteSpace(request.LastName) ? "User" : request.LastName.Trim();
        var username = request.Username.Trim();
        var email = request.Email.Trim().ToLowerInvariant();
        var orgName = string.IsNullOrWhiteSpace(request.OrganizationName)
            ? $"{firstName}'s Workspace"
            : request.OrganizationName.Trim();

        // 1. Check if member already exists in Control DB with same username or email
        var existingMember = await unitOfWork.TenantMemberRepository.FindAsync(m =>
            m.Email.ToLower() == email || m.UserId.ToLower() == username.ToLower(), cancellationToken);

        if (existingMember != null)
        {
            return Conflict(ApiResponse<object>.Fail("An account with this email or username already exists."));
        }

        // 2. Optionally register with Keycloak if admin credentials are configured
        var externalIdentityId = await TryCreateKeycloakUserAsync(request, cancellationToken)
                                 ?? $"usr_{Guid.NewGuid():N}";

        // 3. Create initial Tenant Organization in Control DB
        var tenant = new Tenant
        {
            Name = orgName,
            Description = $"Primary workspace for {firstName} {lastName}",
            ProvisioningState = TenantProvisioningState.Pending,
            TenantSetting = new()
            {
                BillingContactEmail = email,
                OnPremise = false,
                BaseURL = "",
                DbConnectionString = ""
            },
            OperationalDatabase = new TenantOperationalDatabase
            {
                DatabaseServer = "localhost",
                DatabaseName = $"erpez_tenant_{Guid.NewGuid():N}",
                ProvisioningState = TenantProvisioningState.Pending,
                RetryCount = 0
            }
        };

        var module = await unitOfWork.ModuleRepository.FindAsync(m => m.Key == "ams", cancellationToken);
        if (module != null)
        {
            tenant.Modules.Add(module);
        }

        // 3b. Create initial default Starter subscription
        var subscription = new TenantSubscription
        {
            TenantId = tenant.Id,
            Plan = Plan.Starter,
            Status = Status.Active,
            Amount = 0m,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddYears(1),
            BillingCycle = BillingCycle.Monthly,
            AutoRenew = true
        };
        tenant.TenantSubscriptions.Add(subscription);

        await unitOfWork.TenantRepository.AddAsync(tenant, cancellationToken);

        // 4. Create TenantMember with Tenant Administrator role
        var tenantMember = new TenantMember
        {
            UserId = username,
            ExternalIdentityId = externalIdentityId,
            Email = email,
            FirstName = firstName,
            LastName = lastName,
            Status = Status.Active
        };

        var adminRole = await unitOfWork.RoleRepository.FindAsync(r => r.NormalizedName == "TENANT ADMINISTRATOR", cancellationToken);
        if (adminRole != null)
        {
            tenantMember.RoleAssignments.Add(new TenantMemberRoleAssignment
            {
                RoleId = adminRole.Id
            });
        }

        tenant.TenantMembers.Add(tenantMember);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        // 5. Enqueue background provisioning job for operational tenant DB
        backgroundJobClient?.Enqueue<ITenantDatabaseProvisioner>(p => p.ProvisionTenantDatabaseAsync(tenant.Id, CancellationToken.None));

        // 6. Generate signed JWT session
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, externalIdentityId),
            new("sub", externalIdentityId),
            new("tenant_id", tenant.Id.ToString()),
            new("tenantId", tenant.Id.ToString()),
            new("preferred_username", username),
            new("name", $"{firstName} {lastName}".Trim()),
            new(ClaimTypes.Name, $"{firstName} {lastName}".Trim()),
            new(ClaimTypes.Email, email),
            new("email", email),
            new("is_super_admin", "false"),
            new(ClaimTypes.Role, "Tenant Administrator"),
            new("role", "Tenant Administrator")
        };

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
                UserId = username,
                ExternalIdentityId = externalIdentityId,
                DisplayName = $"{firstName} {lastName}".Trim(),
                Email = email,
                Roles = new[] { "Tenant Administrator" },
                TenantId = tenant.Id,
                IsSuperAdmin = false
            },
            Tenant = new
            {
                Id = tenant.Id,
                Name = tenant.Name
            }
        };

        return Ok(ApiResponse<object>.Success(responseData, "Account and workspace registered successfully."));
    }

    private async Task<string?> TryCreateKeycloakUserAsync(RegisterRequest request, CancellationToken cancellationToken)
    {
        var keycloakUrl = configuration["Keycloak:BaseUrl"]
            ?? configuration["Keycloak:Authority"]?.Replace("/realms/erpez", "")
            ?? "https://keycloak.dev.nextstep-software.com";
        var adminUser = configuration["Keycloak:AdminUsername"];
        var adminPass = configuration["Keycloak:AdminPassword"];

        if (string.IsNullOrWhiteSpace(adminUser) || string.IsNullOrWhiteSpace(adminPass))
        {
            return null;
        }

        try
        {
            var client = httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(10);

            var tokenUrl = $"{keycloakUrl.TrimEnd('/')}/realms/master/protocol/openid-connect/token";
            var tokenContent = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["client_id"] = "admin-cli",
                ["username"] = adminUser,
                ["password"] = adminPass,
                ["grant_type"] = "password"
            });

            var tokenRes = await client.PostAsync(tokenUrl, tokenContent, cancellationToken);
            if (!tokenRes.IsSuccessStatusCode) return null;

            var tokenDoc = await System.Text.Json.JsonDocument.ParseAsync(await tokenRes.Content.ReadAsStreamAsync(cancellationToken), cancellationToken: cancellationToken);
            if (!tokenDoc.RootElement.TryGetProperty("access_token", out var tokenProp)) return null;
            var adminToken = tokenProp.GetString();

            var createUserUrl = $"{keycloakUrl.TrimEnd('/')}/admin/realms/erpez/users";
            using var userRequest = new HttpRequestMessage(HttpMethod.Post, createUserUrl);
            userRequest.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", adminToken);
            userRequest.Content = JsonContent.Create(new
            {
                username = request.Username,
                email = request.Email,
                firstName = request.FirstName,
                lastName = request.LastName,
                enabled = true,
                emailVerified = true,
                credentials = new[]
                {
                    new
                    {
                        type = "password",
                        value = request.Password,
                        temporary = false
                    }
                }
            });

            var createRes = await client.SendAsync(userRequest, cancellationToken);
            if (createRes.StatusCode == System.Net.HttpStatusCode.Created)
            {
                var location = createRes.Headers.Location?.ToString();
                if (!string.IsNullOrWhiteSpace(location))
                {
                    return location.Substring(location.LastIndexOf('/') + 1);
                }
            }
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Keycloak user creation failed for user {Username} ({Email}): {ErrorMessage}", request.Username, request.Email, ex.Message);
        }

        return null;
    }

    private async Task<object?> TryKeycloakDirectLoginAsync(string usernameOrEmail, string password, CancellationToken cancellationToken)
    {
        var keycloakUrl = configuration["Keycloak:BaseUrl"]
            ?? configuration["Keycloak:Authority"]?.Replace("/realms/erpez", "")
            ?? "https://keycloak.dev.nextstep-software.com";
        var clientId = configuration["Keycloak:Audience"] ?? "web-client";
        var realm = "erpez";

        try
        {
            var client = httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(10);

            var tokenUrl = $"{keycloakUrl.TrimEnd('/')}/realms/{realm}/protocol/openid-connect/token";
            var tokenContent = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["client_id"] = clientId,
                ["grant_type"] = "password",
                ["username"] = usernameOrEmail,
                ["password"] = password
            });

            var res = await client.PostAsync(tokenUrl, tokenContent, cancellationToken);
            if (!res.IsSuccessStatusCode)
            {
                return null;
            }

            var doc = await System.Text.Json.JsonDocument.ParseAsync(await res.Content.ReadAsStreamAsync(cancellationToken), cancellationToken: cancellationToken);
            var root = doc.RootElement;

            var accessToken = root.TryGetProperty("access_token", out var atProp) ? atProp.GetString() : null;
            var refreshToken = root.TryGetProperty("refresh_token", out var rtProp) ? rtProp.GetString() : null;

            if (string.IsNullOrWhiteSpace(accessToken)) return null;

            // Parse JWT payload from accessToken
            var handler = new JwtSecurityTokenHandler();
            var jwt = handler.ReadJwtToken(accessToken);

            var sub = jwt.Claims.FirstOrDefault(c => c.Type == "sub")?.Value ?? string.Empty;
            var email = jwt.Claims.FirstOrDefault(c => c.Type == "email")?.Value ?? usernameOrEmail;
            var username = jwt.Claims.FirstOrDefault(c => c.Type == "preferred_username")?.Value ?? usernameOrEmail;
            var name = jwt.Claims.FirstOrDefault(c => c.Type == "name")?.Value ?? username;

            var realmRoles = jwt.Claims.Where(c => c.Type == "realm_access" || c.Type == "role" || c.Type == ClaimTypes.Role)
                .Select(c => c.Value).ToList();
            var isSuperAdmin = realmRoles.Any(r => r.Contains("SuperAdmin") || r.Contains("platform_administrator"));

            // Look up tenant membership for this user
            var member = await unitOfWork.TenantMemberRepository.FindAsync(m =>
                (m.ExternalIdentityId == sub || m.Email.ToLower() == email.ToLower() || m.UserId.ToLower() == username.ToLower()) &&
                !m.IsDeleted, cancellationToken);

            var tenantId = member?.TenantId;

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, sub),
                new("sub", sub),
                new("preferred_username", username),
                new("name", name),
                new(ClaimTypes.Name, name),
                new(ClaimTypes.Email, email),
                new("email", email),
                new("is_super_admin", isSuperAdmin.ToString().ToLowerInvariant())
            };

            if (tenantId != null)
            {
                claims.Add(new Claim("tenant_id", tenantId.Value.ToString()));
                claims.Add(new Claim("tenantId", tenantId.Value.ToString()));
            }

            if (realmRoles.Count > 0)
            {
                foreach (var role in realmRoles)
                {
                    claims.Add(new Claim(ClaimTypes.Role, role));
                    claims.Add(new Claim("role", role));
                }
            }
            else
            {
                claims.Add(new Claim(ClaimTypes.Role, "Tenant Administrator"));
                claims.Add(new Claim("role", "Tenant Administrator"));
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

            return new
            {
                Token = tokenString,
                KeycloakAccessToken = accessToken,
                RefreshToken = refreshToken,
                User = new
                {
                    UserId = username,
                    ExternalIdentityId = sub,
                    DisplayName = name,
                    Email = email,
                    Roles = realmRoles.Count > 0 ? realmRoles.ToArray() : new[] { "Tenant Administrator" },
                    TenantId = tenantId,
                    IsSuperAdmin = isSuperAdmin
                }
            };
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Keycloak direct login failed for user {UsernameOrEmail}: {ErrorMessage}", usernameOrEmail, ex.Message);
            return null;
        }
    }
}
