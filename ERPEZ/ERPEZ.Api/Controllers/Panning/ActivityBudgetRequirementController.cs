using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers.Panning
{
    [Route("api/[controller]")]
    [ApiController]
    [ApiExplorerSettings(GroupName = "catalog")]
    public class ActivityBudgetRequirementController : ControllerBase
    {
        // POST api/<ActivityBudgetRequirementController>
        [HttpPost]
        public IActionResult Post([FromBody] string value)
        {
            return Ok("Created");
        }

        // GET: api/<ActivityBudgetRequirementController>
        [HttpGet]
        public IEnumerable<string> GetAll()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/<ActivityBudgetRequirementController>/5
        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            return Ok("value");
        }

        // PUT api/<ActivityBudgetRequirementController>/5
        [HttpPut("{id}")]
        public IActionResult Put(int id, [FromBody] string value)
        {
            return Ok("Updated");
        }

        // DELETE api/<ActivityBudgetRequirementController>/5
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            return Ok("Deleted");
        }
    }
}
