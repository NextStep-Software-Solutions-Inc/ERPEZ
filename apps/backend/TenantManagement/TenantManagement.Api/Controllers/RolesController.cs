using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using ERPEZ.TenantManagement.Application.Features.Roles.Commands.CreateTenantRole;
using ERPEZ.TenantManagement.Application.Features.Roles.Commands.DeleteTenantRole;
using ERPEZ.TenantManagement.Application.Features.Roles.Commands.UpdateTenantRole;
using ERPEZ.TenantManagement.Application.Features.Roles.Dtos;
using ERPEZ.TenantManagement.Application.Features.Roles.Queries.GetAssignableRolesQuery;
using MediatR;
using ERPEZ.TenantManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.TenantManagement.Api.Controllers;

[Route("roles")]
[ApiController]
[Authorize]
public class RolesController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Consumes assignable roles for the current tenant to populate member assignment controls.
    /// Protected by Admin.membersManage. Derives tenant strictly from server context.
    /// Internal filter ensures only TenantManagement scoped roles are returned.
    /// </summary>
    [HttpGet("assignable")]
    [HasPermission(Permissions.Admin.membersManage)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<RoleSummaryDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAssignableRoles()
    {
        var result = await mediator.Send(new GetAssignableRolesQuery(RoleScope.TenantManagement));
        return Ok(result);
    }

    /// <summary>
    /// Creates a custom role within the current tenant.
    /// Protected by Admin.rolesManage and privilege delegation validation.
    /// </summary>
    [HttpPost]
    [HasPermission(Permissions.Admin.rolesManage)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateTenantRole([FromBody] CreateTenantRoleCommand command)
    {
        var result = await mediator.Send(command);
        return StatusCode(StatusCodes.Status201Created, result);
    }

    /// <summary>
    /// Updates an existing custom role within the current tenant.
    /// Protected by Admin.rolesManage and privilege delegation validation.
    /// </summary>
    [HttpPut("{id}")]
    [HasPermission(Permissions.Admin.rolesManage)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateTenantRole(Guid id, [FromBody] UpdateTenantRoleCommand command)
    {
        command.Id = id;
        var result = await mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Soft-deletes an existing custom role within the current tenant.
    /// System roles cannot be deleted.
    /// </summary>
    [HttpDelete("{id}")]
    [HasPermission(Permissions.Admin.rolesManage)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteTenantRole(Guid id)
    {
        var result = await mediator.Send(new DeleteTenantRoleCommand(id));
        return Ok(result);
    }
}
