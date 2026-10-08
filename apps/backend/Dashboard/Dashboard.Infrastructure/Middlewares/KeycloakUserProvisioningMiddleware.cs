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

                    if (string.IsNullOrWhiteSpace(email) && context.Request.Headers.TryGetValue("X-User-Email", out var emailH))
                    {
                        email = emailH.FirstOrDefault();
                    }

                    var username = context.User.FindFirstValue("preferred_username") 
                        ?? context.User.FindFirstValue(ClaimTypes.Name) 
                        ?? email;

                    if (string.IsNullOrWhiteSpace(username) && context.Request.Headers.TryGetValue("X-User-Name", out var userH))
                    {
                        username = userH.FirstOrDefault();
                    }

                    var givenName = context.User.FindFirstValue(ClaimTypes.GivenName) 
                        ?? context.User.FindFirstValue("given_name");

                    if (string.IsNullOrWhiteSpace(givenName) && context.Request.Headers.TryGetValue("X-User-Name", out var nameH))
                    {
                        var fullNameVal = nameH.FirstOrDefault()?.Trim();
                        if (!string.IsNullOrEmpty(fullNameVal))
                        {
                            var parts = fullNameVal.Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
                            givenName = parts.Length > 0 ? parts[0] : fullNameVal;
                        }
                    }

                    var familyName = context.User.FindFirstValue(ClaimTypes.Surname) 
                        ?? context.User.FindFirstValue("family_name");

                    if (string.IsNullOrWhiteSpace(familyName) && context.Request.Headers.TryGetValue("X-User-Name", out var nameH2))
                    {
                        var fullNameVal = nameH2.FirstOrDefault()?.Trim();
                        if (!string.IsNullOrEmpty(fullNameVal))
                        {
                            var parts = fullNameVal.Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
                            if (parts.Length > 1) familyName = parts[1];
                        }
                    }

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

                    var isOperatingAdminHeader = false;
                    if (context.Request.Headers.TryGetValue("X-Operating-Role", out var opRoleH))
                    {
                        var opRole = opRoleH.FirstOrDefault()?.Trim();
                        if (!string.IsNullOrEmpty(opRole) &&
                            (opRole.Equals("System Administrator", StringComparison.OrdinalIgnoreCase) ||
                             opRole.Equals("Tenant Administrator", StringComparison.OrdinalIgnoreCase) ||
                             opRole.Equals("Workspace Admin", StringComparison.OrdinalIgnoreCase) ||
                             opRole.Equals("Workspace Administrator", StringComparison.OrdinalIgnoreCase) ||
                             opRole.Equals("Platform Administrator", StringComparison.OrdinalIgnoreCase)))
                        {
                            isOperatingAdminHeader = true;
                        }
                    }

                    var hasAdminRoleClaim = isSuperAdmin || isOperatingAdminHeader || roleClaims.Any(r =>
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

                        // Update email if current user email is placeholder and real normalizedEmail is available
                        if (!string.IsNullOrEmpty(normalizedEmail) &&
                            (string.IsNullOrEmpty(user.Email) || user.Email.Contains("@keycloak.local") || user.Email.Contains("@workspace.local")))
                        {
                            user.Email = normalizedEmail;
                        }

                        // Check and reconcile duplicate invited stub user if one exists
                        if (!string.IsNullOrEmpty(normalizedEmail))
                        {
                            var duplicateStub = await dbContext.Users
                                .Include(u => u.RoleAssignments!)
                                .FirstOrDefaultAsync(u => u.Id != user.Id && !u.IsDeleted && u.Email.ToLower() == normalizedEmail);

                            if (duplicateStub != null)
                            {
                                if (duplicateStub.RoleAssignments != null && duplicateStub.RoleAssignments.Count > 0)
                                {
                                    foreach (var stubRa in duplicateStub.RoleAssignments.Where(ra => !ra.IsDeleted))
                                    {
                                        var alreadyHas = user.RoleAssignments?.Any(ra => !ra.IsDeleted && ra.RoleId == stubRa.RoleId) == true;
                                        if (!alreadyHas)
                                        {
                                            await dbContext.UserRoleAssignments!.AddAsync(new UserRoleAssignment
                                            {
                                                Id = Guid.NewGuid(),
                                                UserId = user.Id,
                                                RoleId = stubRa.RoleId,
                                                AssignedAt = DateTime.UtcNow,
                                                CreatedAt = DateTime.UtcNow,
                                                CreatedBy = "IdentityReconciliation"
                                            });
                                        }
                                        stubRa.IsDeleted = true;
                                    }
                                }

                                duplicateStub.IsDeleted = true;
                                duplicateStub.DeletedAt = DateTime.UtcNow;
                                duplicateStub.DeletedBy = "IdentityReconciliation";
                            }
                        }

                        if (!string.IsNullOrWhiteSpace(username) && (string.IsNullOrWhiteSpace(user.Username) || user.Username.StartsWith("user_")))
                        {
                            user.Username = username;
                        }

                        if (!string.IsNullOrWhiteSpace(givenName) && (string.IsNullOrWhiteSpace(user.FirstName) || user.FirstName == normalizedEmail?.Split('@')[0]))
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

                                var existingAdmin = await dbContext.UserRoleAssignments!
                                    .IgnoreQueryFilters()
                                    .FirstOrDefaultAsync(ra => ra.UserId == user.Id && ra.RoleId == adminRole.Id);

                                if (existingAdmin != null)
                                {
                                    existingAdmin.IsDeleted = false;
                                    existingAdmin.DeletedAt = null;
                                    existingAdmin.DeletedBy = null;
                                    existingAdmin.UpdatedAt = DateTime.UtcNow;
                                    existingAdmin.UpdatedBy = "AutoProvisioning";
                                }
                                else
                                {
                                    await dbContext.UserRoleAssignments!.AddAsync(new UserRoleAssignment
                                    {
                                        Id = Guid.NewGuid(),
                                        UserId = user.Id,
                                        RoleId = adminRole.Id,
                                        AssignedAt = DateTime.UtcNow,
                                        CreatedAt = DateTime.UtcNow,
                                        CreatedBy = "AutoProvisioning"
                                    });
                                }

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
                                var existingViewer = await dbContext.UserRoleAssignments!
                                    .IgnoreQueryFilters()
                                    .FirstOrDefaultAsync(ra => ra.UserId == user.Id && ra.RoleId == viewerRole.Id);

                                if (existingViewer != null)
                                {
                                    existingViewer.IsDeleted = false;
                                    existingViewer.DeletedAt = null;
                                    existingViewer.DeletedBy = null;
                                    existingViewer.UpdatedAt = DateTime.UtcNow;
                                    existingViewer.UpdatedBy = "AutoProvisioning";
                                }
                                else
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
                                }

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
