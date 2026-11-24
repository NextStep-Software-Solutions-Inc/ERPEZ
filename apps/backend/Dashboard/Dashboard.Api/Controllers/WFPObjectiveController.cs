using Microsoft.AspNetCore.Authorization;
using ERPEZ.Shared.Constants;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using ERPEZ.Application.Features.Planning.WFPObjective.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjective.Commands.CreateWFPObjective;
using ERPEZ.Application.Features.Planning.WFPObjective.Commands.CreateWFPObjectivesBatch;
using ERPEZ.Application.Features.Planning.WFPObjective.Queries.GetWFPObjectives;
using ERPEZ.Application.Features.Planning.WFPObjective.Queries.GetWFPObjectiveById;
using ERPEZ.Application.Features.Planning.WFPObjective.Commands.UpdateWFPObjective;
using ERPEZ.Application.Features.Planning.WFPObjective.Commands.DeleteWFPObjective;

namespace ERPEZ.Api.Controllers
{
    [Route("wfp-objectives")]
    [ApiController]
    [Authorize]
public class WFPObjectiveController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<WFPObjectiveResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<WFPObjectiveResponse>), StatusCodes.Status400BadRequest)]
        [HasPermission(Permissions.Planning.wfpCreate)]
        public async Task<IActionResult> CreateWFPObjective([FromBody] CreateWFPObjectiveCommand command)
        {
            var result = await mediator.Send(command);

            if (!result.Succeeded)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetWFPObjectiveById), new { id = result.Data }, result);
        }

        [HttpPost("batch")]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
        [HasPermission(Permissions.Planning.wfpCreate)]
        public async Task<IActionResult> CreateWFPObjectivesBatch([FromBody] CreateWFPObjectivesBatchCommand command)
        {
            var result = await mediator.Send(command);

            if (!result.Succeeded)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetWFPObjectives), null, result);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<WFPObjectiveResponse>), StatusCodes.Status200OK)]
        [HasPermission(Permissions.Planning.wfpView)]
        public async Task<IActionResult> GetWFPObjectives([FromQuery] GetWFPObjectivesQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<WFPObjectiveDetailedResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HasPermission(Permissions.Planning.wfpView)]
        public async Task<IActionResult> GetWFPObjectiveById(Guid id)
        {
            var result = await mediator.Send(new GetWFPObjectiveByIdQuery(id));
            return result.Succeeded ? Ok(result) : NotFound(result);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HasPermission(Permissions.Planning.wfpUpdate)]
        public async Task<IActionResult> UpdateWFPObjective(Guid id, [FromBody] UpdateWFPObjectiveRequest dto)
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
        [HasPermission(Permissions.Planning.wfpDelete)]
        public async Task<IActionResult> DeleteWFPObjective(Guid id)
        {
            var command = new DeleteWFPObjectiveCommand(id);
            var result = await mediator.Send(command);

            return result.Succeeded ? Ok(result) : BadRequest(result);
        }
    }
}
