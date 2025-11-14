using ERPEZ.Application.Features.Planning.DUKPIAssignment.Commands.CreateDUKPIAssignment;
using ERPEZ.Application.Features.Planning.DUKPIAssignment.Commands.DeleteDUKPIAssignment;
using ERPEZ.Application.Features.Planning.DUKPIAssignment.Commands.UpdateDUKPIAssignment;
using ERPEZ.Application.Features.Planning.DUKPIAssignment.Dtos;
using ERPEZ.Application.Features.Planning.DUKPIAssignment.Queries.GetDUKPIAssignmentById;
using ERPEZ.Application.Features.Planning.DUKPIAssignment.Queries.GetDUKPIAssignments;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers
{
    [Route("du-kpi-assignments")]
    [ApiController]
    public class DUKPIAssignmentController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<DUKPIAssignmentResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<DUKPIAssignmentResponse>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateKPIAssignment([FromBody] CreateDUKPIAssignmentCommand command)
        {
            var result = await mediator.Send(command);

            if (!result.Succeeded)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetKPIAssignmentById), new { id = result.Data!.Id }, result);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<DUKPIAssignmentResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetKPIAssignments([FromQuery] GetDUKPIAssignmentsQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<DUKPIAssignmentResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetKPIAssignmentById(Guid id)
        {
            var result = await mediator.Send(new GetDUKPIAssignmentByIdQuery(id));
            return result.Succeeded ? Ok(result) : NotFound(result);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateDUKPIAssignment(Guid id, [FromBody] UpdateDUKPIAssignmentResponse dto)
        {
            var request = new UpdateDUKPIAssignmentCommand
            {
                Id = id,
                UpdateDUKPIAssignment = dto
            };

            var response = await mediator.Send(request);
            return response.Succeeded ? Ok(response) : BadRequest(response);
        }
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteKPIAssignment(Guid id)
        {
            var command = new DeleteDUKPIAssignmentCommand(id);
            var result = await mediator.Send(command);

            return result.Succeeded ? NoContent() : BadRequest(result);
        }
    }
}
