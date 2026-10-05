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
                    var userExists = await dbContext.Users
                        .AsNoTracking()
                        .AnyAsync(u => u.ExternalIdentityId == externalIdentityId);

                    if (!userExists)
                    {
                        var email = context.User.FindFirstValue(ClaimTypes.Email) 
                            ?? context.User.FindFirstValue("email") 
                            ?? $"{externalIdentityId}@keycloak.local";

                        var username = context.User.FindFirstValue("preferred_username") 
                            ?? context.User.FindFirstValue(ClaimTypes.Name) 
                            ?? email;

                        var givenName = context.User.FindFirstValue(ClaimTypes.GivenName) 
                            ?? context.User.FindFirstValue("given_name") 
                            ?? username;

                        var familyName = context.User.FindFirstValue(ClaimTypes.Surname) 
                            ?? context.User.FindFirstValue("family_name") 
                            ?? "User";

                        var isFirstUser = !await dbContext.Users.AnyAsync();

                        var newUser = new User
                        {
                            Id = Guid.NewGuid(),
                            ExternalIdentityId = externalIdentityId,
                            Username = username,
                            Email = email,
                            FirstName = givenName,
                            LastName = string.IsNullOrWhiteSpace(familyName) ? "User" : familyName,
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow,
                            CreatedBy = "KeycloakJIT"
                        };

                        await dbContext.Users.AddAsync(newUser);

                        // If first user, make them System Administrator; otherwise assign Employee / Viewer
                        var targetRoleName = isFirstUser ? "System Administrator" : "Employee / Viewer";
                        var role = await dbContext.AmsRoles!
                            .FirstOrDefaultAsync(r => r.Name == targetRoleName);

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
