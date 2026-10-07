using System.Security.Claims;
using ERPEZ.Domain.Entities.AMS;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace ERPEZ.Infrastructure.Middlewares;

/// <summary>
/// Just-In-Time (JIT) provisioning middleware for federated Keycloak users.
/// Automatically maps and registers authenticated users into Dashboard.Domain User and AMS role assignment.
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

                    var user = await dbContext.Users
                        .Include(u => u.RoleAssignments)
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

                        // If user has no active role assignments (e.g. was auto-created without any roles), assign default role
                        var hasActiveRoles = user.RoleAssignments != null && user.RoleAssignments.Any(ra => !ra.IsDeleted);
                        if (!hasActiveRoles)
                        {
                            var isFirstUser = !await dbContext.Users.AnyAsync(u => u.Id != user.Id);
                            var targetRoleName = isFirstUser ? "System Administrator" : "Employee / Viewer";
                            var role = await dbContext.AmsRoles!
                                .FirstOrDefaultAsync(r => r.Name == targetRoleName && !r.IsDeleted);

                            if (role != null)
                            {
                                await dbContext.UserRoleAssignments!.AddAsync(new UserRoleAssignment
                                {
                                    Id = Guid.NewGuid(),
                                    UserId = user.Id,
                                    RoleId = role.Id,
                                    AssignedAt = DateTime.UtcNow,
                                    CreatedAt = DateTime.UtcNow,
                                    CreatedBy = "KeycloakJIT"
                                });
                            }
                        }

                        await dbContext.SaveChangesAsync();
                    }
                    else
                    {
                        var isFirstUser = !await dbContext.Users.AnyAsync();
                        var newUser = new User
                        {
                            Id = Guid.NewGuid(),
                            ExternalIdentityId = externalIdentityId,
                            Username = username ?? (string.IsNullOrEmpty(normalizedEmail) ? externalIdentityId : normalizedEmail),
                            Email = string.IsNullOrEmpty(normalizedEmail) ? $"{externalIdentityId}@keycloak.local" : normalizedEmail,
                            FirstName = string.IsNullOrWhiteSpace(givenName) ? (string.IsNullOrEmpty(normalizedEmail) ? "Workspace" : normalizedEmail.Split('@')[0]) : givenName,
                            LastName = string.IsNullOrWhiteSpace(familyName) ? "User" : familyName,
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow,
                            CreatedBy = "KeycloakJIT"
                        };

                        await dbContext.Users.AddAsync(newUser);

                        var targetRoleName = isFirstUser ? "System Administrator" : "Employee / Viewer";
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
                                CreatedBy = "KeycloakJIT"
                            });
                        }

                        await dbContext.SaveChangesAsync();
                    }
                }
            }
        }

        await next(context);
    }
}
