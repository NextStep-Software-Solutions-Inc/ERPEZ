using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DUAllocationController : ControllerBase
    {
        // POST api/<DUAllocationController>
        [HttpPost]
        public IActionResult Post([FromBody] string value)
        {
            return Ok("Created");
        }

        // GET: api/<DUAllocationController>
        [HttpGet]
        public IEnumerable<string> GetAll()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/<DUAllocationController>/5
        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            return Ok("value");
        }

        // PUT api/<DUAllocationController>/5
        [HttpPut("{id}")]
        public IActionResult Put(int id, [FromBody] string value)
        {
            return Ok("Updated");
        }

        // DELETE api/<DUAllocationController>/5
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            return Ok("Deleted");
        }
    }
}
