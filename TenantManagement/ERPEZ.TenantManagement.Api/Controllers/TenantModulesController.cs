using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ERPEZ.TenantManagement.Api.Controllers
{
    [Route("tenant-modules")]
    [ApiController]
    public class TenantModulesController : ControllerBase
    {
        // GET: api/<TenantModulesController>
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/<TenantModulesController>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        // POST api/<TenantModulesController>
        [HttpPost]
        public void Post([FromBody] string value)
        {
        }

        // PUT api/<TenantModulesController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<TenantModulesController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
