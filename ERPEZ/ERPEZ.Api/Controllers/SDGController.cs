using ERPEZ.Application.Features.Planning.SDG.Commands.CreateSDG;
using ERPEZ.Application.Features.Planning.SDG.Commands.DeleteSDG;
using ERPEZ.Application.Features.Planning.SDG.Commands.UpdateSDG;
using ERPEZ.Application.Features.Planning.SDG.Dtos;
using ERPEZ.Application.Features.Planning.SDG.Queries.GetSDGById;
using ERPEZ.Application.Features.Planning.SDG.Queries.GetSDGs;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers
{
    [Route("sdgs")]
    [ApiController]
    public class SDGController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateSDG([FromBody] CreateSDGCommand command)
        {
            var response = await mediator.Send(command);
            return CreatedAtAction(nameof(GetSDGById), new { id = response.Data }, response);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateSDG(Guid id, [FromBody] UpdateSDGCommand command)
        {
            if (id != command.Id)
            {
                return BadRequest("The ID in the URL does not match the ID in the request body.");
            }
            var response = await mediator.Send(command);
            return Ok(response);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteSDG(Guid id)
        {
            var response = await mediator.Send(new DeleteSDGCommand { Id = id });
            return Ok(response);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<SDGResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetSDGs([FromQuery] GetSDGsQuery query)
        {
            var response = await mediator.Send(query);
            return Ok(response);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<SDGResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<SDGResponse>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetSDGById(Guid id)
        {
            var response = await mediator.Send(new GetSDGByIdQuery { Id = id });
            return Ok(response);
        }
    }
}
