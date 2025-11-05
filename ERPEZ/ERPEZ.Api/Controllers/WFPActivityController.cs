using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Application.Features.Planning.WFPActivity.Dtos;
using ERPEZ.Application.Features.Planning.WFPActivity.Commands.CreateWFPActivity;
using ERPEZ.Application.Features.Planning.WFPActivity.Queries.GetWFPActivities;
using ERPEZ.Application.Features.Planning.WFPActivity.Queries.GetWFPActivityById;
using ERPEZ.Application.Features.Planning.WFPActivity.Commands.UpdateWFPActivity;
using ERPEZ.Application.Features.Planning.WFPActivity.Commands.DeleteWFPActivity;

namespace ERPEZ.Api.Controllers
{
    [Route("wfp-activities")]
    [ApiController]
    public class WFPActivityController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<WFPActivityDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<WFPActivityDto>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateWFPActivity([FromBody] CreateWFPActivityCommand command)
        {
            var result = await mediator.Send(command);

            if (!result.Succeeded)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetWFPActivityById), new { id = result.Data!.Id }, result);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<WFPActivity>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetWFPActivities([FromQuery] GetWFPActivitiesQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<WFPActivity>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetWFPActivityById(Guid id)
        {
            var result = await mediator.Send(new GetWFPActivityByIdQuery(id));
            return result.Succeeded ? Ok(result) : NotFound(result);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<WFPActivity>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateWFPActivity(Guid id, [FromBody] UpdateWFPActivityDto dto)
        {
            var command = new UpdateWFPActivityCommand
            {
                Id = id,
                UpdateWFPActivity = dto
            };

            var result = await mediator.Send(command);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteWFPActivity(Guid id)
        {
            var command = new DeleteWFPActivityCommand(id);
            var result = await mediator.Send(command);

            return result.Succeeded ? Ok(result) : BadRequest(result);
        }
    }
}