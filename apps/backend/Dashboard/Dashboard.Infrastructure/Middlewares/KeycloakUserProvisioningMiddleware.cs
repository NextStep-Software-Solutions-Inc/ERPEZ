using System.Security.Claims;
using ERPEZ.Domain.Entities.AMS;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Infrastructure.Persistence;
using ERPEZ.Infrastructure.Persistence.Seeders;
using ERPEZ.Shared.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ERPEZ.Infrastructure.Middlewares;

/// <summary>
/// Just-In-Time (JIT) provisioning middleware for federated identities (Clerk and Keycloak).
/// Automatically maps and registers authenticated users into Dashboard.Domain User and AMS role assignments.
/// Ensures Tenant Administrators & Workspace Admins receive "System Administrator" role, while
/// newly invited workspace users default to "Employee / Viewer" if not initially assigned operational roles.
/// </summary>
public class KeycloakUserProvisioningMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var externalIdentityId = context.User.FindFirstValue(ClaimTypes.NameIdentifier) 
                ?? context.User.FindFirstValue("sub");

            if (!string.IsNullOrWhiteSpace(externalIdentityId))
            {
                var dbContext = context.RequestServices.GetRequiredService<ApplicationDbContext>();
                
                if (dbContext.Users != null)
                {
                    var email = context.User.FindFirstValue(ClaimTypes.Email) 
                        ?? context.User.FindFirstValue("email");

                    var username = context.User.FindFirstValue("preferred_username") 
                        ?? context.User.FindFirstValue(ClaimTypes.Name) 
                        ?? email;

                    var givenName = context.User.FindFirstValue(ClaimTypes.GivenName) 
                        ?? context.User.FindFirstValue("given_name") 
                        ?? username;

                    var familyName = context.User.FindFirstValue(ClaimTypes.Surname) 
                        ?? context.User.FindFirstValue("family_name") 
                        ?? "User";

                    var normalizedEmail = !string.IsNullOrWhiteSpace(email) ? email.Trim().ToLowerInvariant() : "";

                    // Ensure baseline AMS roles exist
                    if (dbContext.AmsRoles != null && !await dbContext.AmsRoles.AnyAsync())
                    {
                        await AmsRoleSeeder.SeedAsync(dbContext);
                    }

                    // Check administrative role claims from token (Clerk org_role, Keycloak realm/client roles, standard Role claims)
                    var roleClaims = context.User.FindAll(ClaimTypes.Role)
                        .Concat(context.User.FindAll("role"))
                        .Concat(context.User.FindAll("roles"))
                        .Concat(context.User.FindAll("org_role"))
                        .Select(c => c.Value)
                        .ToList();

                    var isSuperAdminClaim = context.User.FindFirstValue("is_super_admin") 
                        ?? context.User.FindFirstValue("super_admin");
                    var isSuperAdmin = (bool.TryParse(isSuperAdminClaim, out var isSa) && isSa) 
                        || roleClaims.Any(r => r.Equals("SuperAdmin", StringComparison.OrdinalIgnoreCase) || r.Equals("platform_administrator", StringComparison.OrdinalIgnoreCase));

                    var hasAdminRoleClaim = isSuperAdmin || roleClaims.Any(r =>
                        r.Equals("org:admin", StringComparison.OrdinalIgnoreCase) ||
                        r.Equals("admin", StringComparison.OrdinalIgnoreCase) ||
                        r.Equals("Tenant Administrator", StringComparison.OrdinalIgnoreCase) ||
                        r.Equals("TenantAdmin", StringComparison.OrdinalIgnoreCase) ||
                        r.Equals("DASHBOARD SYSTEM ADMIN", StringComparison.OrdinalIgnoreCase) ||
                        r.Equals("System Administrator", StringComparison.OrdinalIgnoreCase) ||
                        r.Equals("Workspace Admin", StringComparison.OrdinalIgnoreCase));

                    var isControlPlaneAdmin = false;
                    // If no explicit admin claim in token, verify against Control Plane TenantMembers table
                    if (!hasAdminRoleClaim)
                    {
                        var config = context.RequestServices.GetService<IConfiguration>();
                        var controlConnStr = config?.GetConnectionString("DefaultConnection");
                        if (!string.IsNullOrWhiteSpace(controlConnStr))
                        {
                            try
                            {
                                await using var conn = new Npgsql.NpgsqlConnection(controlConnStr);
                                await conn.OpenAsync();
                                const string adminSql = """
                                    SELECT 1
                                    FROM "TenantMembers" tm
                                    JOIN "TenantMemberRoleAssignments" tmra ON tmra."TenantMemberId" = tm."Id"
                                    JOIN "Roles" r ON r."Id" = tmra."RoleId"
                                    WHERE (tm."ExternalIdentityId" = @externalId OR tm."UserId" = @externalId OR (tm."Email" IS NOT NULL AND LOWER(tm."Email") = LOWER(@email)))
                                      AND tm."IsDeleted" = false
                                      AND tm."Status" = 0
                                      AND (
                                        r."NormalizedName" IN ('TENANT ADMINISTRATOR', 'DASHBOARD SYSTEM ADMIN', 'SYSTEM ADMINISTRATOR', 'PLATFORM ADMINISTRATOR')
                                        OR LOWER(r."Name") LIKE '%admin%'
                                      )
                                    LIMIT 1;
                                """;
                                await using var cmd = new Npgsql.NpgsqlCommand(adminSql, conn);
                                cmd.Parameters.AddWithValue("externalId", externalIdentityId);
                                cmd.Parameters.AddWithValue("email", normalizedEmail ?? string.Empty);
                                var scalar = await cmd.ExecuteScalarAsync();
                                if (scalar != null && scalar != DBNull.Value)
                                {
                                    isControlPlaneAdmin = true;
                                }
                            }
                            catch
                            {
                                // Ignore DB check error and rely on token claims
                            }
                        }
                    }

                    var isTargetAdmin = hasAdminRoleClaim || isControlPlaneAdmin;
                    var targetRoleName = isTargetAdmin ? "System Administrator" : "Employee / Viewer";

                    var user = await dbContext.Users
                        .Include(u => u.RoleAssignments!)
                            .ThenInclude(ra => ra.Role)
                        .FirstOrDefaultAsync(u => u.ExternalIdentityId == externalIdentityId ||
                                                  (!string.IsNullOrEmpty(normalizedEmail) && u.Email.ToLower() == normalizedEmail));

                    if (user != null)
                    {
                        // Bind identity if not set or changed
                        if (user.ExternalIdentityId != externalIdentityId)
                        {
                            user.ExternalIdentityId = externalIdentityId;
                        }

                        if (!string.IsNullOrWhiteSpace(username) && (string.IsNullOrWhiteSpace(user.Username) || user.Username.StartsWith("user_")))
                        {
                            user.Username = username;
                        }

                        if (!string.IsNullOrWhiteSpace(givenName) && (string.IsNullOrWhiteSpace(user.FirstName) || user.FirstName == normalizedEmail.Split('@')[0]))
                        {
                            user.FirstName = givenName;
                        }

                        if (!string.IsNullOrWhiteSpace(familyName) && (string.IsNullOrWhiteSpace(user.LastName) || user.LastName == "User"))
                        {
                            user.LastName = familyName;
                        }

                        user.IsActive = true;

                        var currentAssignments = user.RoleAssignments?.Where(ra => !ra.IsDeleted).ToList() ?? [];
                        var hasSystemAdminRole = currentAssignments.Any(ra => ra.Role != null && ra.Role.Name == "System Administrator");

                        // If user is a Tenant / Workspace Admin, ensure they hold the System Administrator role
                        if (isTargetAdmin && !hasSystemAdminRole)
                        {
                            var adminRole = await dbContext.AmsRoles!
                                .FirstOrDefaultAsync(r => r.Name == "System Administrator" && !r.IsDeleted);

                            if (adminRole != null)
                            {
                                var viewerAssignments = currentAssignments.Where(ra => ra.Role != null && ra.Role.Name == "Employee / Viewer").ToList();
                                if (viewerAssignments.Count > 0)
                                {
                                    dbContext.UserRoleAssignments!.RemoveRange(viewerAssignments);
                                }

                                await dbContext.UserRoleAssignments!.AddAsync(new UserRoleAssignment
                                {
                                    Id = Guid.NewGuid(),
                                    UserId = user.Id,
                                    RoleId = adminRole.Id,
                                    AssignedAt = DateTime.UtcNow,
                                    CreatedAt = DateTime.UtcNow,
                                    CreatedBy = "AutoProvisioning"
                                });

                                await dbContext.SaveChangesAsync();

                                var authService = context.RequestServices.GetService<IUserAuthorizationService>();
                                authService?.InvalidateUserPermissions(externalIdentityId, null);
                            }
                            else
                            {
                                await dbContext.SaveChangesAsync();
                            }
                        }
                        else if (!isTargetAdmin && currentAssignments.Count == 0)
                        {
                            // Regular invited user with no operational roles pre-assigned -> default to Employee / Viewer
                            var viewerRole = await dbContext.AmsRoles!
                                .FirstOrDefaultAsync(r => r.Name == "Employee / Viewer" && !r.IsDeleted);

                            if (viewerRole != null)
                            {
                                await dbContext.UserRoleAssignments!.AddAsync(new UserRoleAssignment
                                {
                                    Id = Guid.NewGuid(),
                                    UserId = user.Id,
                                    RoleId = viewerRole.Id,
                                    AssignedAt = DateTime.UtcNow,
                                    CreatedAt = DateTime.UtcNow,
                                    CreatedBy = "AutoProvisioning"
                                });

                                await dbContext.SaveChangesAsync();

                                var authService = context.RequestServices.GetService<IUserAuthorizationService>();
                                authService?.InvalidateUserPermissions(externalIdentityId, null);
                            }
                            else
                            {
                                await dbContext.SaveChangesAsync();
                            }
                        }
                        else
                        {
                            await dbContext.SaveChangesAsync();
                        }
                    }
                    else
                    {
                        var newUser = new User
                        {
                            Id = Guid.NewGuid(),
                            ExternalIdentityId = externalIdentityId,
                            Username = username ?? (string.IsNullOrEmpty(normalizedEmail) ? externalIdentityId : normalizedEmail),
                            Email = string.IsNullOrEmpty(normalizedEmail) ? $"{externalIdentityId}@workspace.local" : normalizedEmail,
                            FirstName = string.IsNullOrWhiteSpace(givenName) ? (string.IsNullOrEmpty(normalizedEmail) ? "Workspace" : normalizedEmail.Split('@')[0]) : givenName,
                            LastName = string.IsNullOrWhiteSpace(familyName) ? "User" : familyName,
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow,
                            CreatedBy = "AutoProvisioning"
                        };

                        await dbContext.Users.AddAsync(newUser);

                        var role = await dbContext.AmsRoles!
                            .FirstOrDefaultAsync(r => r.Name == targetRoleName && !r.IsDeleted);

                        if (role != null)
                        {
                            await dbContext.UserRoleAssignments!.AddAsync(new UserRoleAssignment
                            {
                                Id = Guid.NewGuid(),
                                UserId = newUser.Id,
                                RoleId = role.Id,
                                AssignedAt = DateTime.UtcNow,
                                CreatedAt = DateTime.UtcNow,
                                CreatedBy = "AutoProvisioning"
                            });
                        }

                        await dbContext.SaveChangesAsync();

                        var authService = context.RequestServices.GetService<IUserAuthorizationService>();
                        authService?.InvalidateUserPermissions(externalIdentityId, null);
                    }
                }
            }
        }

        await next(context);
    }
}
