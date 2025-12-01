using ERPEZ.Application.Features.Planning.KPITarget.Commands.CreateKPITarget;
using ERPEZ.Application.Features.Planning.KPITarget.Commands.DeleteKPITarget;
using ERPEZ.Application.Features.Planning.KPITarget.Commands.UpdateKPITarget;
using ERPEZ.Application.Features.Planning.KPITarget.Dtos;
using ERPEZ.Application.Features.Planning.KPITarget.Queries.GetKPITargetById;
using ERPEZ.Application.Features.Planning.KPITarget.Queries.GetKPITargets;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers
{
    [Route("kpi-targets")]
    [ApiController]
    public class KPITargetController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<KPITargetResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<KPITargetResponse>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateKPITarget([FromBody] CreateKPITargetCommand command)
        {
            var result = await mediator.Send(command);

            if (!result.Succeeded)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetKPITargetById), new { id = result.Data!.Id }, result);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<KPITargetResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetKPITargets([FromQuery] GetKPITargetsQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<KPITargetResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetKPITargetById(Guid id)
        {
            var result = await mediator.Send(new GetKPITargetByIdQuery(id));
            return result.Succeeded ? Ok(result) : NotFound(result);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<KPITargetResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateKPITarget(Guid id, [FromBody] UpdateKPITargetRequest dto)
        {
            var command = new UpdateKPITargetCommand
            {
                Id = id,
                UpdateKPITarget = dto
            };

            var result = await mediator.Send(command);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteKPITarget(Guid id)
        {
            var command = new DeleteKPITargetCommand(id);
            var result = await mediator.Send(command);

            return result.Succeeded ? Ok(result) : BadRequest(result);
        }
    }
}
