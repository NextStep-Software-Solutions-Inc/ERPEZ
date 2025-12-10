using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Application.Features.Planning.WFPOutcome.Dtos;
using ERPEZ.Application.Features.Planning.WFPOutcome.Commands.CreateWFPOutcome;
using ERPEZ.Application.Features.Planning.WFPOutcome.Queries.GetWFPOutcomes;
using ERPEZ.Application.Features.Planning.WFPOutcome.Queries.GetWFPOutcomeById;
using ERPEZ.Application.Features.Planning.WFPOutcome.Commands.UpdateWFPOutcome;
using ERPEZ.Application.Features.Planning.WFPOutcome.Commands.DeleteWFPOutcome;

namespace ERPEZ.Api.Controllers
{
    [Route("wfp-outcomes")]
    [ApiController]
    public class WFPOutcomeController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<WFPOutcomeResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<WFPOutcomeResponse>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateWFPOutcome([FromBody] CreateWFPOutcomeCommand command)
        {
            var result = await mediator.Send(command);

            if (!result.Succeeded)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetWFPOutcomeById), new { id = result.Data!.Id }, result);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<WFPOutcome>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetWFPOutcomes([FromQuery] GetWFPOutcomesQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<WFPOutcome>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetWFPOutcomeById(Guid id)
        {
            var result = await mediator.Send(new GetWFPOutcomeByIdQuery(id));
            return result.Succeeded ? Ok(result) : NotFound(result);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<WFPOutcome>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateWFPOutcome(Guid id, [FromBody] UpdateWFPOutcomeRequest dto)
        {
            var command = new UpdateWFPOutcomeCommand
            {
                Id = id,
                UpdateWFPOutcome = dto
            };

            var result = await mediator.Send(command);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteWFPOutcome(Guid id)
        {
            var command = new DeleteWFPOutcomeCommand(id);
            var result = await mediator.Send(command);

            return result.Succeeded ? Ok(result) : BadRequest(result);
        }
    }
}
