using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using ERPEZ.Application.Features.Planning.OPCRActivity.Commands.CreateOPCRActivity;
using ERPEZ.Application.Features.Planning.OPCRActivity.Dtos;
using ERPEZ.Application.Features.Planning.OPCRActivity.Queries.GetOPCRActivities;
using ERPEZ.Application.Features.Planning.OPCRActivity.Queries.GetOPCRActivityById;
using ERPEZ.Application.Features.Planning.OPCRActivity.Commands.UpdateOPCRActivity;
using ERPEZ.Application.Features.Planning.OPCRActivity.Commands.DeleteOPCRActivity;

namespace ERPEZ.Api.Controllers
{
    [Route("opcr-activities")]
    [ApiController]
    public class OPCRActivityController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateOPCRActivity([FromBody] CreateOPCRActivityCommand command)
        {
            var result = await mediator.Send(command);

            if (!result.Succeeded)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetOPCRActivityById), new { id = result.Data }, result);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<OPCRActivityResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetOPCRActivities([FromQuery] GetOPCRActivitiesQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<OPCRActivityDetailedResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetOPCRActivityById(Guid id)
        {
            var result = await mediator.Send(new GetOPCRActivityByIdQuery(id));
            return result.Succeeded ? Ok(result) : NotFound(result);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateOPCRActivity(Guid id, [FromBody] UpdateOPCRActivityRequest dto)
        {
            var command = new UpdateOPCRActivityCommand
            {
                Id = id,
                UpdateOPCRActivity = dto,
            };

            var result = await mediator.Send(command);
            return result.Succeeded ? Ok(ApiResponse<Unit>.Success(Unit.Value)) : BadRequest(result);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteOPCRActivity(Guid id)
        {
            var command = new DeleteOPCRActivityCommand(id);
            var result = await mediator.Send(command);

            return result.Succeeded ? NoContent() : NotFound();
        }
    }
}
