using ERPEZ.Application.Features.Planning.UACSCodeCombination.Commands.CreateUACSCodeCombination;
using ERPEZ.Application.Features.Planning.UACSCodeCombination.Commands.DeleteUACSCodeCombination;
using ERPEZ.Application.Features.Planning.UACSCodeCombination.Commands.UpdateUACSCodeCombination;
using ERPEZ.Application.Features.Planning.UACSCodeCombination.Dtos;
using ERPEZ.Application.Features.Planning.UACSCodeCombination.Queries.GetUACSCodeCombinationById;
using ERPEZ.Application.Features.Planning.UACSCodeCombination.Queries.GetUACSCodeCombinations;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers
{
    [Route("uacs-code-combinations")]
    [ApiController]
    public class UACSCodeCombinationsController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateUACSCodeCombination([FromBody] CreateUACSCodeCombinationCommand command)
        {
            var response = await mediator.Send(command);

            if (!response.Succeeded)
                return BadRequest(response);

            return CreatedAtAction(nameof(GetUACSCodeCombinationById), new { id = response.Data }, response);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<UACSCodeCombinationResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetUACSCodeCombinations([FromQuery] GetUACSCodeCombinationsQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<UACSCodeCombinationResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetUACSCodeCombinationById(Guid id)
        {
            var response = await mediator.Send(new GetUACSCodeCombinationByIdQuery(id));
            return response.Succeeded ? Ok(response) : BadRequest(response);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateUACSCodeCombination(Guid id, [FromBody] UpdateUACSCodeCombinationRequest updateUACSCodeCombination)
        {
            var request = new UpdateUACSCodeCombinationCommand
            {
                Id = id,
                UpdateUACSCodeCombination = updateUACSCodeCombination
            };

            var response = await mediator.Send(request);
            return response.Succeeded ? Ok(response) : BadRequest(response);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteUACSCodeCombination(Guid id)
        {
            var command = new DeleteUACSCodeCombinationCommand(id);
            var response = await mediator.Send(command);

            return response.Succeeded ? Ok(response) : BadRequest(response);
        }
    }
}
