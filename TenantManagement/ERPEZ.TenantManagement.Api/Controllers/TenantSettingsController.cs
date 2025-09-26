using ERPEZ.TenantManagement.Application.Common;
using ERPEZ.TenantManagement.Application.Features.Tenants.Queries.GetTenants;
using ERPEZ.TenantManagement.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ERPEZ.TenantManagement.Api.Controllers
{
    [Route("tenant-settings")]
    [ApiController]
    public class TenantSettingsController(ISender mediator) : ControllerBase
    {
        // GET: api/<TenantSettingsController>
        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<TenantSetting>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetTenants([FromQuery] GetTenantSettingQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        // GET api/<TenantSettingsController>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        // POST api/<TenantSettingsController>
        [HttpPost]
        public void Post([FromBody] string value)
        {
        }

        // PUT api/<TenantSettingsController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<TenantSettingsController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
