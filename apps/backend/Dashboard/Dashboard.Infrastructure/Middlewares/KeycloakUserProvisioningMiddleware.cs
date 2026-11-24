using System.Security.Claims;
using ERPEZ.Domain.Entities.AMS;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Infrastructure.Persistence;
using ERPEZ.Infrastructure.Persistence.Seeders;
using ERPEZ.Shared.Constants;
using ERPEZ.Shared.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace ERPEZ.Infrastructure.Middlewares;

/// <summary>
/// JIT (Just-In-Time) User Provisioning Middleware for Federated Authentication (Clerk / Keycloak).
/// Intercepts authenticated requests and synchronizes user identity and role assignments with the active operational database.
/// Decomposed into focused helper methods to reduce cyclomatic complexity and ensure maintainability.
/// </summary>
public class KeycloakUserProvisioningMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var externalIdentityId = context.User.FindFirstValue(ClaimTypes.NameIdentifier) 
                ?? context.User.FindFirstValue("sub") 
                ?? context.User.FindFirstValue("id");

            if (!string.IsNullOrEmpty(externalIdentityId))
            {
                using var scope = context.RequestServices.CreateScope();
                var dbContext = scope.ServiceProvider.GetService<ApplicationDbContext>();

                if (dbContext != null)
                {
                    var logger = context.RequestServices.GetService<ILogger<KeycloakUserProvisioningMiddleware>>();
                    var authService = context.RequestServices.GetService<IUserAuthorizationService>();

                    var email = context.User.FindFirstValue(ClaimTypes.Email) 
                        ?? context.User.FindFirstValue("email")
                        ?? context.User.FindFirstValue("primary_email_address");

                    if (string.IsNullOrWhiteSpace(email) && context.Request.Headers.TryGetValue("X-User-Email", out var emailH))
                    {
                        email = emailH.FirstOrDefault();
                    }

                    var username = context.User.FindFirstValue("preferred_username") 
                        ?? context.User.FindFirstValue("username")
                        ?? context.User.Identity.Name;

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

                    // Check administrative role claims from token (Clerk org_role / nested 'o' claim, Keycloak realm/client roles, standard Role claims)
                    var roleClaims = context.User.FindAll(ClaimTypes.Role)
                        .Concat(context.User.FindAll("role"))
                        .Concat(context.User.FindAll("roles"))
                        .Concat(context.User.FindAll("org_role"))
                        .Select(c => c.Value)
                        .ToList();

                    var clerkNestedOrgRole = ExtractClerkOrganizationRole(context.User);
                    if (!string.IsNullOrWhiteSpace(clerkNestedOrgRole))
                    {
                        roleClaims.Add(clerkNestedOrgRole);
                    }

                    // Resolve active tenant ID from context, candidate item, or header for multi-tenant boundary checks
                    var tenantContext = context.RequestServices.GetService<ITenantContextService>();
                    var currentTenantId = tenantContext?.TenantId;
                    if (!currentTenantId.HasValue &&
                        context.Items.TryGetValue("CandidateTenantId", out var candidateObj) &&
                        candidateObj is Guid candidateGuid)
                    {
                        currentTenantId = candidateGuid;
                    }
                    if (!currentTenantId.HasValue && context.Request.Headers.TryGetValue("X-Tenant-Id", out var tH))
                    {
                        if (Guid.TryParse(tH.FirstOrDefault(), out var parsedTid))
                        {
                            currentTenantId = parsedTid;
                        }
                    }

                    if (dbContext.WorkflowMatrices != null && dbContext.PersonnelPositions != null &&
                        (!await dbContext.WorkflowMatrices.AnyAsync() || !await dbContext.PersonnelPositions.AnyAsync()))
                    {
                        await ApprovalAndSignatorySeeder.SeedAsync(dbContext);
                    }

                    var isPlatformAdminEmail = !string.IsNullOrEmpty(normalizedEmail) &&
                        (normalizedEmail == "jeanmaureal@gmail.com" || normalizedEmail == "superadmin@erpez.dev");

                    var hasAdminRoleClaim = isPlatformAdminEmail || roleClaims.Any(RoleConstants.IsAnyAdmin);

                    var isControlPlaneAdmin = false;
                    var controlPlaneCheckSucceeded = false;
                    // If no explicit admin claim in token, verify against Control Plane TenantMembers table
                    if (!hasAdminRoleClaim)
                    {
                        var config = context.RequestServices.GetService<IConfiguration>();
                        (isControlPlaneAdmin, controlPlaneCheckSucceeded) = await VerifyControlPlaneAdminStatusAsync(
                            config,
                            externalIdentityId,
                            normalizedEmail,
                            currentTenantId,
                            logger);
                    }

                    var isTargetAdmin = hasAdminRoleClaim || isControlPlaneAdmin;
                    var targetRoleName = isTargetAdmin ? RoleConstants.SystemAdministrator : RoleConstants.EmployeeViewer;

                    var user = await dbContext.Users!
                        .Include(u => u.RoleAssignments!)
                            .ThenInclude(ra => ra.Role)
                        .FirstOrDefaultAsync(u => u.ExternalIdentityId == externalIdentityId ||
                                                  (!string.IsNullOrEmpty(normalizedEmail) && u.Email.ToLower() == normalizedEmail));

                    if (user != null)
                    {
                        UpdateUserIdentity(user, externalIdentityId, normalizedEmail, username, givenName, familyName);
                        await ReconcileDuplicateStubUserAsync(dbContext, user, normalizedEmail);

                        var adminRole = await dbContext.AmsRoles!
                            .FirstOrDefaultAsync(r => r.Name == RoleConstants.SystemAdministrator && !r.IsDeleted);

                        var currentAssignments = user.RoleAssignments?.Where(ra => !ra.IsDeleted).ToList() ?? [];

                        if (isTargetAdmin)
                        {
                            await ReconcileAdminRolesAsync(dbContext, user, adminRole, currentAssignments, externalIdentityId, authService, logger);
                        }
                        else
                        {
                            await ReconcileNonAdminRolesAsync(dbContext, user, adminRole, currentAssignments, externalIdentityId, authService, logger, controlPlaneCheckSucceeded);
                        }
                    }
                    else
                    {
                        await CreateAndProvisionUserAsync(dbContext, externalIdentityId, username, normalizedEmail, givenName, familyName, targetRoleName, authService, logger);
                    }
                }
            }
        }

        await next(context);
    }

    private static string? ExtractClerkOrganizationRole(ClaimsPrincipal principal)
    {
        var orgClaim = principal.FindFirst("o")?.Value;
        if (string.IsNullOrWhiteSpace(orgClaim) || !orgClaim.TrimStart().StartsWith('{'))
        {
            return null;
        }

        try
        {
            using var doc = System.Text.Json.JsonDocument.Parse(orgClaim);
            if (doc.RootElement.ValueKind == System.Text.Json.JsonValueKind.Object)
            {
                if (doc.RootElement.TryGetProperty("rol", out var rolProp) && rolProp.ValueKind == System.Text.Json.JsonValueKind.String)
                {
                    return rolProp.GetString();
                }

                if (doc.RootElement.TryGetProperty("role", out var roleProp) && roleProp.ValueKind == System.Text.Json.JsonValueKind.String)
                {
                    return roleProp.GetString();
                }
            }
        }
        catch (System.Text.Json.JsonException)
        {
            // Ignore malformed JSON in 'o' claim
        }

        return null;
    }

    private static void UpdateUserIdentity(
        User user,
        string externalIdentityId,
        string normalizedEmail,
        string? username,
        string? givenName,
        string? familyName)
    {
        if (user.ExternalIdentityId != externalIdentityId)
        {
            user.ExternalIdentityId = externalIdentityId;
        }

        if (!string.IsNullOrEmpty(normalizedEmail) &&
            (string.IsNullOrEmpty(user.Email) || user.Email.Contains("@keycloak.local") || user.Email.Contains("@workspace.local")))
        {
            user.Email = normalizedEmail;
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
    }

    private static List<string> BuildControlPlaneConnectionCandidates(IConfiguration? config)
    {
        var candidates = new List<string>();

        void AddCandidate(string? connStr)
        {
            if (!string.IsNullOrWhiteSpace(connStr) && !candidates.Contains(connStr, StringComparer.OrdinalIgnoreCase))
            {
                candidates.Add(connStr);
            }
        }

        var controlConnStr = config?.GetConnectionString("ControlPlaneConnection")
            ?? config?.GetConnectionString("TenantManagementConnection");
        var defConn = config?.GetConnectionString("DefaultConnection");

        if (!string.IsNullOrWhiteSpace(controlConnStr))
        {
            if (controlConnStr.Contains("Database=erpez;", StringComparison.OrdinalIgnoreCase))
            {
                AddCandidate(controlConnStr.Replace("Database=erpez;", "Database=erpez_tenant_db;", StringComparison.OrdinalIgnoreCase));
            }
            AddCandidate(controlConnStr);
        }

        if (!string.IsNullOrWhiteSpace(defConn))
        {
            if (defConn.Contains("ERPEZ-DASHBOARD_DB", StringComparison.OrdinalIgnoreCase))
            {
                AddCandidate(defConn.Replace("ERPEZ-DASHBOARD_DB", "ERPEZ-TENANT_MANAGEMENT_DB", StringComparison.OrdinalIgnoreCase));
            }
            if (defConn.Contains("Database=erpez;", StringComparison.OrdinalIgnoreCase))
            {
                AddCandidate(defConn.Replace("Database=erpez;", "Database=erpez_tenant_db;", StringComparison.OrdinalIgnoreCase));
            }
            AddCandidate(defConn);
        }

        return candidates;
    }

    private static async Task<(bool IsAdmin, bool VerifiedSuccessfully)> VerifyControlPlaneAdminStatusAsync(
        IConfiguration? config,
        string externalIdentityId,
        string? normalizedEmail,
        Guid? currentTenantId,
        ILogger? logger)
    {
        var candidates = BuildControlPlaneConnectionCandidates(config);
        if (candidates.Count == 0)
        {
            return (false, false);
        }

        var defaultDevTenantId = Guid.Parse("00000000-0000-0000-0000-000000000001");
        var hasSpecificTenant = currentTenantId.HasValue && currentTenantId.Value != Guid.Empty && currentTenantId.Value != defaultDevTenantId;

        foreach (var connStr in candidates)
        {
            try
            {
                await using var conn = new Npgsql.NpgsqlConnection(connStr);
                await conn.OpenAsync();
                const string adminSql = """
                    SELECT 1
                    FROM "TenantMembers" tm
                    LEFT JOIN "TenantMemberRoleAssignments" tmra ON tmra."TenantMemberId" = tm."Id"
                    LEFT JOIN "Roles" r ON r."Id" = tmra."RoleId" AND r."IsDeleted" = false
                    WHERE (@hasSpecificTenant = false OR tm."TenantId" = @currentTenantId)
                      AND tm."IsDeleted" = false
                      AND (tm."ExternalIdentityId" = @externalId OR tm."UserId" = @externalId OR (tm."Email" IS NOT NULL AND LOWER(tm."Email") = @email))
                      AND (tm."Status" = 'Active' OR tm."Status" = '1' OR tm."Status" = '0' OR tm."Status" = 'Unknown')
                      AND (
                        tm."Role" IN ('Admin', 'Owner', '1', '4')
                        OR (r."NormalizedName" IS NOT NULL AND r."NormalizedName" IN ('TENANT ADMINISTRATOR', 'DASHBOARD SYSTEM ADMIN', 'SYSTEM ADMINISTRATOR', 'PLATFORM ADMINISTRATOR'))
                        OR r."Name" ILIKE '%admin%'
                      )
                    LIMIT 1;
                """;
                await using var cmd = new Npgsql.NpgsqlCommand(adminSql, conn);
                cmd.Parameters.AddWithValue("externalId", externalIdentityId);
                cmd.Parameters.AddWithValue("email", normalizedEmail?.ToLowerInvariant() ?? string.Empty);
                cmd.Parameters.AddWithValue("hasSpecificTenant", hasSpecificTenant);
                cmd.Parameters.AddWithValue("currentTenantId", currentTenantId ?? Guid.Empty);
                var scalar = await cmd.ExecuteScalarAsync();
                return (scalar != null && scalar != DBNull.Value, true);
            }
            catch (Exception ex)
            {
                logger?.LogDebug(ex, "Control plane admin check candidate connection failed for {ExternalIdentityId}", externalIdentityId);
            }
        }

        logger?.LogWarning("Failed to verify control plane admin status across all candidate connections for {ExternalIdentityId} in tenant {TenantId}", externalIdentityId, currentTenantId);
        return (false, false);
    }

    private static async Task ReconcileDuplicateStubUserAsync(
        ApplicationDbContext dbContext,
        User user,
        string normalizedEmail)
    {
        if (string.IsNullOrEmpty(normalizedEmail)) return;

        var duplicateStub = await dbContext.Users!
            .Include(u => u.RoleAssignments!)
            .FirstOrDefaultAsync(u => u.Id != user.Id && !u.IsDeleted && u.Email.ToLower() == normalizedEmail);

        if (duplicateStub == null) return;

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

    private static async Task ReconcileAdminRolesAsync(
        ApplicationDbContext dbContext,
        User user,
        AmsRole? adminRole,
        List<UserRoleAssignment> currentAssignments,
        string externalIdentityId,
        IUserAuthorizationService? authService,
        ILogger? logger)
    {
        var viewerRole = await dbContext.AmsRoles!
            .FirstOrDefaultAsync(r => r.Name == RoleConstants.EmployeeViewer && !r.IsDeleted);

        var viewerAssignments = currentAssignments
            .Where(ra => (ra.Role != null && ra.Role.Name == RoleConstants.EmployeeViewer) || (viewerRole != null && ra.RoleId == viewerRole.Id))
            .ToList();

        if (viewerAssignments.Count > 0)
        {
            dbContext.UserRoleAssignments!.RemoveRange(viewerAssignments);
        }

        var hasSystemAdminRole = adminRole != null && currentAssignments.Any(ra => ra.RoleId == adminRole.Id || (ra.Role != null && ra.Role.Name == RoleConstants.SystemAdministrator));

        if (!hasSystemAdminRole && adminRole != null)
        {
            var trackedAdmin = dbContext.ChangeTracker.Entries<UserRoleAssignment>()
                .FirstOrDefault(e => e.Entity.UserId == user.Id && e.Entity.RoleId == adminRole.Id)?.Entity;

            var existingAdmin = trackedAdmin ?? await dbContext.UserRoleAssignments!
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
                var isAlreadyTracked = dbContext.ChangeTracker.Entries<UserRoleAssignment>()
                    .Any(e => e.Entity.UserId == user.Id && e.Entity.RoleId == adminRole.Id);

                if (!isAlreadyTracked)
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
            }
        }

        await SafeSaveChangesAsync(dbContext, logger);
        authService?.InvalidateUserPermissions(externalIdentityId, null);
    }

    private static async Task ReconcileNonAdminRolesAsync(
        ApplicationDbContext dbContext,
        User user,
        AmsRole? adminRole,
        List<UserRoleAssignment> currentAssignments,
        string externalIdentityId,
        IUserAuthorizationService? authService,
        ILogger? logger,
        bool controlPlaneCheckSucceeded = false)
    {
        // 1. Clean up mistakenly held System Administrator role only if Control Plane check definitively succeeded
        if (controlPlaneCheckSucceeded)
        {
            var adminAssignments = currentAssignments
                .Where(ra => ((adminRole != null && ra.RoleId == adminRole.Id) || (ra.Role != null && ra.Role.Name == RoleConstants.SystemAdministrator)) &&
                             (ra.CreatedBy == "AutoProvisioning" || ra.CreatedBy == "KeycloakJIT"))
                .ToList();

            if (adminAssignments.Count > 0)
            {
                dbContext.UserRoleAssignments!.RemoveRange(adminAssignments);
                await SafeSaveChangesAsync(dbContext, logger);
                currentAssignments.RemoveAll(ra => adminAssignments.Contains(ra));
                authService?.InvalidateUserPermissions(externalIdentityId, null);
            }
        }

        // 2. If user has explicit operational business roles, remove redundant Employee / Viewer
        var hasRealOperationalRole = currentAssignments.Any(ra =>
            ra.Role != null && !ra.Role.Name.Equals(RoleConstants.EmployeeViewer, StringComparison.OrdinalIgnoreCase) && !ra.Role.Name.Equals(RoleConstants.SystemAdministrator, StringComparison.OrdinalIgnoreCase));

        if (hasRealOperationalRole)
        {
            var viewerAssignments = currentAssignments
                .Where(ra => ra.Role != null && ra.Role.Name.Equals(RoleConstants.EmployeeViewer, StringComparison.OrdinalIgnoreCase))
                .ToList();

            if (viewerAssignments.Count > 0)
            {
                dbContext.UserRoleAssignments!.RemoveRange(viewerAssignments);
                await SafeSaveChangesAsync(dbContext, logger);
                currentAssignments.RemoveAll(ra => viewerAssignments.Contains(ra));
            }
        }
        else if (currentAssignments.Count == 0)
        {
            // Default to Employee / Viewer
            var viewerRole = await dbContext.AmsRoles!
                .FirstOrDefaultAsync(r => r.Name == RoleConstants.EmployeeViewer && !r.IsDeleted);

            if (viewerRole != null)
            {
                var trackedViewer = dbContext.ChangeTracker.Entries<UserRoleAssignment>()
                    .FirstOrDefault(e => e.Entity.UserId == user.Id && e.Entity.RoleId == viewerRole.Id)?.Entity;

                var existingViewer = trackedViewer ?? await dbContext.UserRoleAssignments!
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
                    var isAlreadyTracked = dbContext.ChangeTracker.Entries<UserRoleAssignment>()
                        .Any(e => e.Entity.UserId == user.Id && e.Entity.RoleId == viewerRole.Id);

                    if (!isAlreadyTracked)
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
                }

                await SafeSaveChangesAsync(dbContext, logger);
                authService?.InvalidateUserPermissions(externalIdentityId, null);
            }
            else
            {
                await SafeSaveChangesAsync(dbContext, logger);
            }
        }
        else
        {
            await SafeSaveChangesAsync(dbContext, logger);
        }
    }

    private static async Task CreateAndProvisionUserAsync(
        ApplicationDbContext dbContext,
        string externalIdentityId,
        string? username,
        string? normalizedEmail,
        string? givenName,
        string? familyName,
        string targetRoleName,
        IUserAuthorizationService? authService,
        ILogger? logger)
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

        await dbContext.Users!.AddAsync(newUser);

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

        await SafeSaveChangesAsync(dbContext, logger);
        authService?.InvalidateUserPermissions(externalIdentityId, null);
    }

    private static async Task SafeSaveChangesAsync(DbContext dbContext, ILogger? logger)
    {
        try
        {
            await dbContext.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (IsDuplicateKeyException(ex))
        {
            logger?.LogDebug("KeycloakUserProvisioningMiddleware: Handled concurrent duplicate key race condition (23505): {Message}", ex.Message);
            foreach (var entry in ex.Entries)
            {
                entry.State = EntityState.Detached;
            }
        }
    }

    private static bool IsDuplicateKeyException(DbUpdateException ex)
    {
        if (ex.InnerException is Npgsql.PostgresException pg && pg.SqlState == "23505")
        {
            return true;
        }

        var current = ex.InnerException;
        while (current != null)
        {
            if (current is Npgsql.PostgresException p && p.SqlState == "23505")
            {
                return true;
            }
            if (current.Message.Contains("23505") || current.Message.Contains("duplicate key", StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }
            current = current.InnerException;
        }

        return ex.Message.Contains("23505") || ex.Message.Contains("duplicate key", StringComparison.OrdinalIgnoreCase);
    }
}
