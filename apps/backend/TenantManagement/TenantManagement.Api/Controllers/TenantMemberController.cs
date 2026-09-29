using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using ERPEZ.TenantManagement.Application.Features.TenantMembers.Commands.AcceptInvitation;
using ERPEZ.TenantManagement.Application.Features.TenantMembers.Commands.CreateTenantMember;
using ERPEZ.TenantManagement.Application.Features.TenantMembers.Commands.DeleteTenantMember;
using ERPEZ.TenantManagement.Application.Features.TenantMembers.Commands.RevokeInvitation;
using ERPEZ.TenantManagement.Application.Features.TenantMembers.Commands.ToggleTenantMemberStatus;
using ERPEZ.TenantManagement.Application.Features.TenantMembers.Commands.UpdateTenantMember;
using ERPEZ.TenantManagement.Application.Features.TenantMembers.Dtos;
using ERPEZ.TenantManagement.Application.Features.TenantMembers.Queries.GetTenantMemberByIdQuery;
using ERPEZ.TenantManagement.Application.Features.TenantMembers.Queries.GetTenantMembersQuery;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using ERPEZ.TenantManagement.Application.Features.Roles.Dtos;
using ERPEZ.TenantManagement.Application.Features.Roles.Queries.GetAssignableRolesQuery;
using ERPEZ.TenantManagement.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.TenantManagement.Api.Controllers;

[Route("tenant-members")]
[ApiController]
public class TenantMembersController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Returns assignable governance roles for tenant account administration (Org Admin, Billing Admin, Auditor, Tenant Member).
    /// Hardcoded internal filter: RoleScope == TenantManagement.
    /// </summary>
    [HttpGet("assignable-roles")]
    [HasPermission(Permissions.Admin.membersManage)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<RoleSummaryDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAssignableGovernanceRoles()
    {
        var result = await mediator.Send(new GetAssignableRolesQuery(RoleScope.Tenant));
        return Ok(result);
    }
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<CreateTenantMemberResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [HasPermission(Permissions.Admin.membersManage)]
    public async Task<IActionResult> CreateTenantMember([FromBody] CreateTenantMemberCommand command)
    {
        var response = await mediator.Send(command);
        return CreatedAtAction(nameof(GetTenantMemberById), new { id = response.Data?.Id }, response);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<TenantMemberDto>), StatusCodes.Status200OK)]
    [HasPermission(Permissions.Admin.membersManage)]
    public async Task<IActionResult> GetTenantMembers([FromQuery] GetTenantMembersQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<TenantMemberDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Admin.membersManage)]
    public async Task<IActionResult> GetTenantMemberById(Guid id)
    {
        var query = new GetTenantMemberByIdQuery(id);
        var tenantMember = await mediator.Send(query);
        return Ok(tenantMember);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [HasPermission(Permissions.Admin.membersManage)]
    public async Task<IActionResult> UpdateTenantMember(Guid id, [FromBody] UpdateTenantMemberDto tenantMemberDto)
    {
        var command = new UpdateTenantMemberCommand
        {
            Id = id,
            UpdateTenantMember = tenantMemberDto
        };

        var result = await mediator.Send(command);
        return Ok(result);
    }

    [HttpPatch("{id}/status")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [HasPermission(Permissions.Admin.membersManage)]
    public async Task<IActionResult> ToggleTenantMemberStatus(Guid id, [FromBody] ToggleTenantMemberStatusDto dto)
    {
        var command = new ToggleTenantMemberStatusCommand
        {
            Id = id,
            Status = dto.Status,
            ConcurrencyStamp = dto.ConcurrencyStamp
        };

        var result = await mediator.Send(command);
        return Ok(result);
    }

    [HttpPost("{id}/invitation/revoke")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Admin.membersManage)]
    public async Task<IActionResult> RevokeInvitation(Guid id)
    {
        var command = new RevokeInvitationCommand(id);
        var result = await mediator.Send(command);
        return Ok(result);
    }

    [HttpPost("invitations/accept")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AcceptInvitation([FromBody] AcceptInvitationCommand command)
    {
        var result = await mediator.Send(command);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Admin.membersManage)]
    public async Task<IActionResult> DeleteTenantMember(Guid id)
    {
        var command = new DeleteTenantMemberCommand(id);
        var result = await mediator.Send(command);
        return Ok(result);
    }
}
