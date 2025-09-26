using ERPEZ.TenantManagement.Application.Common;
using ERPEZ.TenantManagement.Application.Features.Tenants.Commands.CreateTenant;
using ERPEZ.TenantManagement.Application.Features.Tenants.Queries.GetTenants;
using ERPEZ.TenantManagement.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ERPEZ.TenantManagement.Api.Controllers
{
    [Route("tenants")]
    [ApiController]
    public class TenantsController(ISender mediator) : ControllerBase
    {
        // GET: api/<TenantController>
        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<Tenant>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetTenants([FromQuery] GetTenantsQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        // GET api/<TenantController>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        // POST api/<TenantController>
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateTenant([FromBody] CreateTenantCommand command)
        {
            var tenantId = await mediator.Send(command);
            var response = ApiResponse<Guid>.Success(tenantId, "Tenant created successfully.");
            return CreatedAtAction(nameof(GetTenants), new { id = tenantId }, response);
        }

        // PUT api/<TenantController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<TenantController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
