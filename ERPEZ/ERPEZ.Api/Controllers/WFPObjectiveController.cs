using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Application.Features.Planning.WFPObjective.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjective.Commands.CreateWFPObjective;
using ERPEZ.Application.Features.Planning.WFPObjective.Queries.GetWFPObjectives;
using ERPEZ.Application.Features.Planning.WFPObjective.Queries.GetWFPObjectiveById;
using ERPEZ.Application.Features.Planning.WFPObjective.Commands.UpdateWFPObjective;
using ERPEZ.Application.Features.Planning.WFPObjective.Commands.DeleteWFPObjective;

namespace ERPEZ.Api.Controllers
{
    [Route("wfp-objectives")]
    [ApiController]
    public class WFPObjectiveController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<WFPObjectiveDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<WFPObjectiveDto>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateWFPObjective([FromBody] CreateWFPObjectiveCommand command)
        {
            var result = await mediator.Send(command);

            if (!result.Succeeded)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetWFPObjectiveById), new { id = result.Data!.Id }, result);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<WFPObjective>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetWFPObjectives([FromQuery] GetWFPObjectivesQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<WFPObjective>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetWFPObjectiveById(Guid id)
        {
            var result = await mediator.Send(new GetWFPObjectiveByIdQuery(id));
            return result.Succeeded ? Ok(result) : NotFound(result);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<WFPObjective>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateWFPObjective(Guid id, [FromBody] UpdateWFPObjectiveDto dto)
        {
            var command = new UpdateWFPObjectiveCommand
            {
                Id = id,
                UpdateWFPObjective = dto
            };

            var result = await mediator.Send(command);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteWFPObjective(Guid id)
        {
            var command = new DeleteWFPObjectiveCommand(id);
            var result = await mediator.Send(command);

            return result.Succeeded ? Ok(result) : BadRequest(result);
        }
    }
}