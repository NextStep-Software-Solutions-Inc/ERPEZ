using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using ERPEZ.TenantManagement.Application.Features.Roles.Commands.AssignOperationalRoles;
using ERPEZ.TenantManagement.Application.Features.Roles.Dtos;
using ERPEZ.TenantManagement.Application.Features.Roles.Queries.GetAssignableRolesQuery;
using ERPEZ.TenantManagement.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.TenantManagement.Api.Controllers;

[Route("operational-roles")]
[ApiController]
[Authorize]
public class OperationalRolesController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Returns assignable operational business roles (Planning Officer, LIB Approver, Finance, Procurement, etc.).
    /// Hardcoded internal filter: RoleScope == Operational.
    /// </summary>
    [HttpGet("assignable")]
    [HasPermission(Permissions.Admin.operationalRolesView)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<RoleSummaryDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAssignableOperationalRoles()
    {
        var result = await mediator.Send(new GetAssignableRolesQuery(RoleScope.Operational));
        return Ok(result);
    }

    /// <summary>
    /// Assigns operational business roles to a tenant member within the active workspace.
    /// Target resource is canonically identified by TargetTenantMemberId.
    /// Validator strictly enforces: Target roles MUST be RoleScope.Operational.
    /// </summary>
    [HttpPost("assignments")]
    [HasPermission(Permissions.Admin.operationalRolesManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AssignOperationalRoles([FromBody] AssignOperationalRolesDto dto)
    {
        var command = new AssignOperationalRolesCommand(dto.TargetTenantMemberId, dto.RoleIds);
        var result = await mediator.Send(command);
        return Ok(result);
    }
}
