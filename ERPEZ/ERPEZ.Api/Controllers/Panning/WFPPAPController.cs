using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers.Panning
{
    [Route("api/[controller]")]
    [ApiController]
    [ApiExplorerSettings(GroupName = "catalog")]
    public class WFPPAPController : ControllerBase
    {
        [HttpPost]
        public void Post([FromBody] string value)
        {
        }

        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
