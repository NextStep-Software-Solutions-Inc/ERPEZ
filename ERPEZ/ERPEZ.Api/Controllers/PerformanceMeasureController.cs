using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Application.Features.Planning.PerformanceMeasure.Commands.CreatePM;
using ERPEZ.Application.Features.Planning.PerformanceMeasure.Dtos;
using ERPEZ.Application.Features.Planning.PerformanceMeasure.Queries.GetPMs;
using ERPEZ.Application.Features.Planning.PerformanceMeasure.Queries.GetPMById;
using ERPEZ.Application.Features.Planning.PerformanceMeasure.Commands.UpdatePM;
using ERPEZ.Application.Features.Planning.PerformanceMeasure.Commands.DeletePM;


namespace ERPEZ.Api.Controllers
{
    [Route("performance-measures")]
    [ApiController]
    public class PerformanceMeasureController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreatePerformanceMeasure([FromBody] CreatePerformanceMeasureCommand command)
        {
            var result = await mediator.Send(command);

            if (!result.Succeeded)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetPerformanceMeasureById), new { id = result.Data!.Id }, result);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<PerformanceMeasureResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPerformanceMeasures([FromQuery] GetPerformanceMeasuresQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<PerformanceMeasureDetailedResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetPerformanceMeasureById(Guid id)
        {
            var result = await mediator.Send(new GetPerformanceMeasureByIdQuery(id));
            return result.Succeeded ? Ok(result) : NotFound(result);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdatePerformanceMeasure(Guid id, [FromBody] UpdatePerformanceMeasureRequest dto)
        {
            var command = new UpdatePerformanceMeasureCommand
            {
                Id = id,
                UpdatePerformanceMeasure = dto
            };

            var result = await mediator.Send(command);
            return result.Succeeded ? Ok(ApiResponse<Unit>.Success(Unit.Value)) : BadRequest(result);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeletePerformanceMeasure(Guid id)
        {
            var command = new DeletePerformanceMeasureCommand(id);
            var result = await mediator.Send(command);

            return result.Succeeded ? NoContent() : NotFound();
        }
    }
}
