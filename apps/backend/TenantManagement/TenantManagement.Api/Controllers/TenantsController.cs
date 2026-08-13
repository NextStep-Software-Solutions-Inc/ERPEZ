using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Application.Features.Tenants.Commands.CreateTenant;
using ERPEZ.TenantManagement.Application.Features.Tenants.Commands.DeleteTenant;
using ERPEZ.TenantManagement.Application.Features.Tenants.Commands.UpdateTenant;
using ERPEZ.TenantManagement.Application.Features.Tenants.Dtos;
using ERPEZ.TenantManagement.Application.Features.Tenants.Queries.GetTenantById;
using ERPEZ.TenantManagement.Application.Features.Tenants.Queries.GetTenants;
using ERPEZ.TenantManagement.Application.Features.Tenants.Queries.GetTenantsByMe;
using ERPEZ.TenantManagement.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.TenantManagement.Api.Controllers
{
    [Route("tenants")]
    [ApiController]
    public class TenantsController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
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
        public async Task<IActionResult> GetTenants([FromQuery] GetTenantsQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse<TenantDetailedResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetTenantById(Guid id)
        {
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
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateTenant(Guid id, [FromBody] UpdateTenantDto updateTenant)
        {
            var request = new UpdateTenantCommand
            {
                Id = id,
                UpdateTenant = updateTenant
            };

            var tenant = await mediator.Send(request);
            return tenant.Succeeded ? Ok(ApiResponse<Unit>.Success(Unit.Value)) : BadRequest(tenant);
        }

        [HttpDelete("{id}")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteTenant(Guid id)
        {
            var command = new DeleteTenantCommand(id);
            var tenant = await mediator.Send(command);

            return tenant.Succeeded ? NoContent() : NotFound();
        }
    }
}
