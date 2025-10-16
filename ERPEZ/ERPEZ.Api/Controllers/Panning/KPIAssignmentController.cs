using ERPEZ.Application.Features.Planning.KPIAssignment.Commands.CreateKPIAssignment;
using ERPEZ.Application.Features.Planning.KPIAssignment.Commands.DeleteKPIAssignment;
using ERPEZ.Application.Features.Planning.KPIAssignment.Commands.UpdateKPIAssignment;
using ERPEZ.Application.Features.Planning.KPIAssignment.Dtos;
using ERPEZ.Application.Features.Planning.KPIAssignment.Queries.GetKPIAssignmentById;
using ERPEZ.Application.Features.Planning.KPIAssignment.Queries.GetKPIAssignments;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers.Panning
{
    [Route("kpi-assignments")]
    [ApiController]
    [ApiExplorerSettings(GroupName = "catalog")]
    public class KPIAssignmentController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<KPIAssignmentDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<KPIAssignmentDto>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateKPIAssignment([FromBody] CreateKPIAssignmentCommand command)
        {
            var result = await mediator.Send(command);

            if (!result.Succeeded)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetKPIAssignmentById), new { id = result.Data!.Id }, result);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<KPIAssignmentDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetKPIAssignments([FromQuery] GetKPIAssignmentsQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<KPIAssignmentDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetKPIAssignmentById(Guid id)
        {
            var result = await mediator.Send(new GetKPIAssignmentByIdQuery(id));
            return result.Succeeded ? Ok(result) : NotFound(result);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<KPIAssignmentDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateKPIAssignment(Guid id, [FromBody] UpdateKPIAssignmentDto dto)
        {
            var command = new UpdateKPIAssignmentCommand
            {
                Id = id,
                UpdateKPIAssignment = dto
            };

            var result = await mediator.Send(command);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteKPIAssignment(Guid id)
        {
            var command = new DeleteKPIAssignmentCommand(id);
            var result = await mediator.Send(command);

            return result.Succeeded ? NoContent() : BadRequest(result);
        }
    }
}
