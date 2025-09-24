using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ERPEZ.TenantManagement.Api.Controllers
{
    [Route("tenants")]
    [ApiController]
    public class TenantsController : ControllerBase
    {
        // GET: api/<TenantController>
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/<TenantController>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        // POST api/<TenantController>
        [HttpPost]
        public void Post([FromBody] string value)
        {
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
