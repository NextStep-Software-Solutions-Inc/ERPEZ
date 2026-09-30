using ERPEZ.Shared.Constants;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Interfaces;
using ERPEZ.TenantManagement.Application.Features.Tenants.Commands.CreateTenant;
using ERPEZ.TenantManagement.Application.Features.Tenants.Commands.DeleteTenant;
using ERPEZ.TenantManagement.Application.Features.Tenants.Commands.UpdateTenant;
using ERPEZ.TenantManagement.Application.Features.Tenants.Commands.UpdateTenantModules;
using ERPEZ.TenantManagement.Application.Features.Tenants.Commands.ToggleTenantStatus;
using ERPEZ.TenantManagement.Application.Features.Tenants.Dtos;
using ERPEZ.TenantManagement.Application.Features.Tenants.Queries.GetTenantById;
using ERPEZ.TenantManagement.Application.Features.Tenants.Queries.GetTenants;
using ERPEZ.TenantManagement.Application.Features.Tenants.Queries.GetTenantsByMe;
using ERPEZ.TenantManagement.Domain.Constants;
using ERPEZ.TenantManagement.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.TenantManagement.Api.Controllers
{
    [Route("tenants")]
    [ApiController]
    public class TenantsController(
        ISender mediator,
        ICurrentUserService currentUser,
        IUserAuthorizationService authorizationService) : ControllerBase
    {
        [HttpPost]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
        // [HasPermission(Permissions.Admin.tenantsManage)]
        public async Task<IActionResult> CreateTenant([FromBody] CreateTenantCommand command)
        {
            var tenant = await mediator.Send(command);

            if (!tenant.Succeeded)
                return BadRequest(tenant);

            return CreatedAtAction(nameof(GetTenantById), new { id = tenant.Data }, tenant);
        }

        [HttpGet]
        [Authorize]
        [ProducesResponseType(typeof(PaginatedApiResponse<TenantDto>), StatusCodes.Status200OK)]
        [HasPermission(Permissions.Admin.tenantsManage)]
        public async Task<IActionResult> GetTenants([FromQuery] GetTenantsQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}", Name = "GetTenantById")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse<TenantDetailedResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetTenantById(Guid id)
        {
            if (!await CanAccessTenantAsync(
                    id,
                    PlatformPermissions.tenantsView,
                    PlatformPermissions.tenantsManage,
                    TenantPermissions.workspaceView,
                    TenantPermissions.workspaceManage,
                    Permissions.Admin.systemAdminView,
                    Permissions.Admin.systemAdminManage,
                    Permissions.Admin.tenantsManage))
            {
                return Forbid();
            }

            var tenant = await mediator.Send(new GetTenantByIdQuery(id));

            return tenant.Succeeded ? Ok(tenant) : BadRequest(tenant);
        }

        [HttpGet("my")]
        [Authorize]
        [ProducesResponseType(typeof(PaginatedApiResponse<IReadOnlyList<TenantDto>>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetMyTenants([FromQuery] GetMyTenantsQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpPut("{id}")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateTenant(Guid id, [FromBody] UpdateTenantDto updateTenant)
        {
            if (!await CanAccessTenantAsync(
                    id,
                    PlatformPermissions.tenantsManage,
                    TenantPermissions.workspaceManage,
                    Permissions.Admin.systemAdminManage,
                    Permissions.Admin.tenantsManage))
            {
                return Forbid();
            }

            var request = new UpdateTenantCommand
            {
                Id = id,
                UpdateTenant = updateTenant
            };

            var tenant = await mediator.Send(request);
            return tenant.Succeeded ? Ok(ApiResponse<Unit>.Success(Unit.Value)) : BadRequest(tenant);
        }

        [HttpPut("{id}/modules")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateTenantModules(Guid id, [FromBody] List<string> moduleKeys)
        {
            if (!await CanAccessTenantAsync(
                    id,
                    PlatformPermissions.tenantsManage,
                    TenantPermissions.workspaceManage,
                    Permissions.Admin.systemAdminManage,
                    Permissions.Admin.tenantsManage))
            {
                return Forbid();
            }

            var command = new UpdateTenantModulesCommand
            {
                TenantId = id,
                ModuleKeys = moduleKeys
            };

            var result = await mediator.Send(command);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        private async Task<bool> CanAccessTenantAsync(Guid tenantId, params string[] permissions)
        {
            if (currentUser.IsSuperAdmin)
            {
                return true;
            }

            var externalIdentityId = currentUser.ExternalIdentityId;
            if (string.IsNullOrWhiteSpace(externalIdentityId))
            {
                return false;
            }

            foreach (var permission in permissions)
            {
                if (await authorizationService.HasPermissionAsync(externalIdentityId, tenantId, permission))
                {
                    return true;
                }
            }

            return false;
        }

        [HttpPatch("{id}/status")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HasPermission(Permissions.Admin.tenantsManage)]
        public async Task<IActionResult> ToggleTenantStatus(Guid id, [FromBody] bool isDisabled)
        {
            var result = await mediator.Send(new ToggleTenantStatusCommand(id, isDisabled));
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id}")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HasPermission(Permissions.Admin.tenantsManage)]
        public async Task<IActionResult> DeleteTenant(Guid id)
        {
            var command = new DeleteTenantCommand(id);
            var tenant = await mediator.Send(command);

            return tenant.Succeeded ? NoContent() : NotFound();
        }
    }
}
