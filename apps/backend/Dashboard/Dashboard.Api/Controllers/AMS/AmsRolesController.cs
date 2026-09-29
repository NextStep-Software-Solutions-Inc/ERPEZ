using ERPEZ.Application.Common.Dtos.AMS;
using ERPEZ.Domain.Entities.AMS;
using ERPEZ.Infrastructure.Persistence;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using ERPEZ.Shared.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Api.Controllers.AMS;

[Route("api/ams/roles")]
[ApiController]
[Authorize]
public class AmsRolesController(
    ApplicationDbContext dbContext,
    IUserAuthorizationService authorizationService) : ControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.Admin.rolesManage)]
    [ProducesResponseType(typeof(ApiResponse<List<AmsRoleDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllRoles(CancellationToken cancellationToken)
    {
        var roles = await dbContext.AmsRoles!
            .AsNoTracking()
            .Where(r => !r.IsDeleted)
            .OrderByDescending(r => r.IsSystemRole)
            .ThenBy(r => r.Name)
            .Select(r => new AmsRoleDto
            {
                Id = r.Id,
                Name = r.Name,
                Description = r.Description,
                IsSystemRole = r.IsSystemRole,
                IsActive = r.IsActive,
                UserCount = r.UserAssignments.Count(ua => !ua.IsDeleted),
                PermissionCount = r.Permissions.Count(p => !p.IsDeleted),
                Permissions = r.Permissions.Where(p => !p.IsDeleted).Select(p => p.PermissionKey).ToList()
            })
            .ToListAsync(cancellationToken);

        return Ok(ApiResponse<List<AmsRoleDto>>.Success(roles));
    }

    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.Admin.rolesManage)]
    [ProducesResponseType(typeof(ApiResponse<AmsRoleDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetRoleById(Guid id, CancellationToken cancellationToken)
    {
        var role = await dbContext.AmsRoles!
            .AsNoTracking()
            .Where(r => r.Id == id && !r.IsDeleted)
            .Select(r => new AmsRoleDto
            {
                Id = r.Id,
                Name = r.Name,
                Description = r.Description,
                IsSystemRole = r.IsSystemRole,
                IsActive = r.IsActive,
                UserCount = r.UserAssignments.Count(ua => !ua.IsDeleted),
                PermissionCount = r.Permissions.Count(p => !p.IsDeleted),
                Permissions = r.Permissions.Where(p => !p.IsDeleted).Select(p => p.PermissionKey).ToList()
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (role == null)
        {
            return NotFound(ApiResponse<AmsRoleDto>.Fail("Role not found."));
        }

        return Ok(ApiResponse<AmsRoleDto>.Success(role));
    }

    [HttpPost]
    [HasPermission(Permissions.Admin.rolesManage)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateRole([FromBody] CreateAmsRoleDto request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(ApiResponse<Guid>.Fail("Role name is required."));
        }

        var exists = await dbContext.AmsRoles!.AnyAsync(r => r.Name.ToLower() == request.Name.Trim().ToLower() && !r.IsDeleted, cancellationToken);
        if (exists)
        {
            return BadRequest(ApiResponse<Guid>.Fail($"Role with name '{request.Name}' already exists."));
        }

        var role = new AmsRole
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Description = request.Description.Trim(),
            IsSystemRole = false,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = User.Identity?.Name ?? "Admin"
        };

        await dbContext.AmsRoles!.AddAsync(role, cancellationToken);

        if (request.Permissions != null && request.Permissions.Count > 0)
        {
            var validPerms = Permissions.GetAllPermissions().ToHashSet(StringComparer.OrdinalIgnoreCase);
            foreach (var perm in request.Permissions.Distinct())
            {
                if (validPerms.Contains(perm))
                {
                    await dbContext.AmsRolePermissions!.AddAsync(new AmsRolePermission
                    {
                        Id = Guid.NewGuid(),
                        RoleId = role.Id,
                        PermissionKey = perm,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = User.Identity?.Name ?? "Admin"
                    }, cancellationToken);
                }
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetRoleById), new { id = role.Id }, ApiResponse<Guid>.Success(role.Id));
    }

    [HttpPut("{id:guid}")]
    [HasPermission(Permissions.Admin.rolesManage)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateRole(Guid id, [FromBody] UpdateAmsRoleDto request, CancellationToken cancellationToken)
    {
        var role = await dbContext.AmsRoles!
            .Include(r => r.Permissions)
            .Include(r => r.UserAssignments)
                .ThenInclude(ua => ua.User)
            .FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted, cancellationToken);

        if (role == null)
        {
            return NotFound(ApiResponse<bool>.Fail("Role not found."));
        }

        if (!role.IsSystemRole && !string.IsNullOrWhiteSpace(request.Name))
        {
            role.Name = request.Name.Trim();
        }

        role.Description = request.Description?.Trim() ?? role.Description;
        role.IsActive = request.IsActive;
        role.UpdatedAt = DateTime.UtcNow;
        role.UpdatedBy = User.Identity?.Name ?? "Admin";

        // Update permissions
        if (request.Permissions != null)
        {
            var validPerms = Permissions.GetAllPermissions().ToHashSet(StringComparer.OrdinalIgnoreCase);
            var desiredPerms = request.Permissions.Where(p => validPerms.Contains(p)).ToHashSet(StringComparer.OrdinalIgnoreCase);

            var existingPerms = role.Permissions.Where(p => !p.IsDeleted).ToList();
            foreach (var ep in existingPerms)
            {
                if (!desiredPerms.Contains(ep.PermissionKey))
                {
                    dbContext.AmsRolePermissions!.Remove(ep);
                }
            }

            var currentKeys = existingPerms.Select(p => p.PermissionKey).ToHashSet(StringComparer.OrdinalIgnoreCase);
            foreach (var np in desiredPerms)
            {
                if (!currentKeys.Contains(np))
                {
                    await dbContext.AmsRolePermissions!.AddAsync(new AmsRolePermission
                    {
                        Id = Guid.NewGuid(),
                        RoleId = role.Id,
                        PermissionKey = np,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = User.Identity?.Name ?? "Admin"
                    }, cancellationToken);
                }
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        // Invalidate permissions cache for all users assigned to this role
        foreach (var ua in role.UserAssignments.Where(ua => ua.User != null && !string.IsNullOrWhiteSpace(ua.User.ExternalIdentityId)))
        {
            authorizationService.InvalidateUserPermissions(ua.User.ExternalIdentityId!, null);
        }

        return Ok(ApiResponse<bool>.Success(true));
    }

    [HttpDelete("{id:guid}")]
    [HasPermission(Permissions.Admin.rolesManage)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteRole(Guid id, CancellationToken cancellationToken)
    {
        var role = await dbContext.AmsRoles!
            .Include(r => r.UserAssignments)
                .ThenInclude(ua => ua.User)
            .FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted, cancellationToken);

        if (role == null)
        {
            return NotFound(ApiResponse<bool>.Fail("Role not found."));
        }

        if (role.IsSystemRole)
        {
            return BadRequest(ApiResponse<bool>.Fail("System baseline roles cannot be deleted."));
        }

        role.IsDeleted = true;
        role.DeletedAt = DateTime.UtcNow;
        role.DeletedBy = User.Identity?.Name ?? "Admin";

        await dbContext.SaveChangesAsync(cancellationToken);

        foreach (var ua in role.UserAssignments.Where(ua => ua.User != null && !string.IsNullOrWhiteSpace(ua.User.ExternalIdentityId)))
        {
            authorizationService.InvalidateUserPermissions(ua.User.ExternalIdentityId!, null);
        }

        return Ok(ApiResponse<bool>.Success(true));
    }

    [HttpGet("permissions")]
    [HasPermission(Permissions.Admin.rolesManage)]
    [ProducesResponseType(typeof(ApiResponse<List<PermissionGroupDto>>), StatusCodes.Status200OK)]
    public IActionResult GetPermissionCatalog()
    {
        var all = Permissions.GetAllPermissions();
        var groups = all
            .GroupBy(p => p.Split('.').FirstOrDefault() ?? "general")
            .Select(g => new PermissionGroupDto
            {
                Category = Capitalize(g.Key),
                Permissions = g.OrderBy(x => x).ToList()
            })
            .OrderBy(g => g.Category)
            .ToList();

        return Ok(ApiResponse<List<PermissionGroupDto>>.Success(groups));
    }

    [HttpPost("assign")]
    [HasPermission(Permissions.Admin.rolesManage)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AssignUserRoles([FromBody] AssignUserRolesDto request, CancellationToken cancellationToken)
    {
        var user = await dbContext.Users!
            .Include(u => u.RoleAssignments)
            .FirstOrDefaultAsync(u => u.Id == request.UserId && !u.IsDeleted, cancellationToken);

        if (user == null)
        {
            return BadRequest(ApiResponse<bool>.Fail("User not found."));
        }

        // Remove existing assignments
        if (user.RoleAssignments.Count > 0)
        {
            dbContext.UserRoleAssignments!.RemoveRange(user.RoleAssignments);
        }

        // Add new assignments
        if (request.RoleIds != null && request.RoleIds.Count > 0)
        {
            var validRoleIds = await dbContext.AmsRoles!
                .Where(r => request.RoleIds.Contains(r.Id) && !r.IsDeleted && r.IsActive)
                .Select(r => r.Id)
                .ToListAsync(cancellationToken);

            foreach (var roleId in validRoleIds)
            {
                await dbContext.UserRoleAssignments!.AddAsync(new UserRoleAssignment
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    RoleId = roleId,
                    AssignedAt = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = User.Identity?.Name ?? "Admin"
                }, cancellationToken);
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        if (!string.IsNullOrWhiteSpace(user.ExternalIdentityId))
        {
            authorizationService.InvalidateUserPermissions(user.ExternalIdentityId, null);
        }

        return Ok(ApiResponse<bool>.Success(true));
    }

    [HttpGet("users/{userId:guid}")]
    [HasPermission(Permissions.Admin.rolesManage)]
    [ProducesResponseType(typeof(ApiResponse<List<AmsRoleDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUserRoles(Guid userId, CancellationToken cancellationToken)
    {
        var roles = await dbContext.UserRoleAssignments!
            .AsNoTracking()
            .Where(ua => ua.UserId == userId && !ua.IsDeleted && ua.Role != null && !ua.Role.IsDeleted)
            .Select(ua => new AmsRoleDto
            {
                Id = ua.Role.Id,
                Name = ua.Role.Name,
                Description = ua.Role.Description,
                IsSystemRole = ua.Role.IsSystemRole,
                IsActive = ua.Role.IsActive,
                Permissions = ua.Role.Permissions.Where(p => !p.IsDeleted).Select(p => p.PermissionKey).ToList()
            })
            .ToListAsync(cancellationToken);

        return Ok(ApiResponse<List<AmsRoleDto>>.Success(roles));
    }

    private static string Capitalize(string text)
    {
        if (string.IsNullOrEmpty(text)) return text;
        return char.ToUpperInvariant(text[0]) + text[1..];
    }
}
