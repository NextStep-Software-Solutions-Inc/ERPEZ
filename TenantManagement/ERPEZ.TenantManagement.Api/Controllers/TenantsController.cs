using ERPEZ.TenantManagement.Application.Common;
using ERPEZ.TenantManagement.Application.Features.Tenants.Commands.CreateTenant;
using ERPEZ.TenantManagement.Application.Features.Tenants.Commands.UpdateTenant;
using ERPEZ.TenantManagement.Application.Features.Tenants.Commands.DeleteTenant;
using ERPEZ.TenantManagement.Application.Features.Tenants.Queries.GetTenants;
using ERPEZ.TenantManagement.Application.Features.Tenants.Queries.GetTenantById;
using ERPEZ.TenantManagement.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.TenantManagement.Api.Controllers
{
    [Route("tenants")]
    [ApiController]
    public class TenantsController(ISender mediator) : ControllerBase
    {
        // R - READ (List)
        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<Tenant>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetTenants([FromQuery] GetTenantsQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        // R - READ (Single by ID)
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<Tenant>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetTenantById(Guid id)
        {
            var query = new GetTenantByIdQuery(id);
            var tenant = await mediator.Send(query);

            if (tenant == null)
            {
                return NotFound(ApiResponse<Tenant>.Fail($"Tenant with ID {id} not found."));
            }

            return Ok(ApiResponse<Tenant>.Success(tenant, "Tenant retrieved successfully."));
        }

        // C - CREATE
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateTenant([FromBody] CreateTenantCommand command)
        {
            var tenantId = await mediator.Send(command);
            var response = ApiResponse<Guid>.Success(tenantId, "Tenant created successfully.");

            return CreatedAtAction(nameof(GetTenantById), new { id = tenantId }, response);
        }

        // U - UPDATE
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateTenant(Guid id, [FromBody] UpdateTenantCommand command)
        {
            if (id != command.Id)
            {
                return BadRequest(ApiResponse<Tenant>.Fail("ID mismatch between route and body."));
            }

            var response = await mediator.Send(command);

            return NoContent();
        }

        // D - DELETE
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteTenant(Guid id)
        {
            var command = new DeleteTenantCommand(id);

            await mediator.Send(command);

            return NoContent();
        }
    }
}