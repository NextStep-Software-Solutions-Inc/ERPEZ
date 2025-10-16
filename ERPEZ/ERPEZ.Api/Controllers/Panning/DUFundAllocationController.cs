using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers.Panning
{
    [Route("api/[controller]")]
    [ApiController]
    [ApiExplorerSettings(GroupName = "catalog")]
    public class DUFundAllocationController : ControllerBase
    {
        [HttpPost]
        public IActionResult Post([FromBody] string value)
        {
            return Ok("Created");
        }

        [HttpGet]
        public IEnumerable<string> GetAll()
        {
            return new string[] { "value1", "value2" };
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            return Ok("value");
        }

        [HttpPut("{id}")]
        public IActionResult Put(int id, [FromBody] string value)
        {
            return Ok("Updated");
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            return Ok("Deleted");
        }
    }
}
