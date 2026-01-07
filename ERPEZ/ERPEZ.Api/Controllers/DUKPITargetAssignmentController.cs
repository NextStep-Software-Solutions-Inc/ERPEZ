using ERPEZ.Application.Features.Planning.DUKPITargetAssignment.Commands.DeleteDUKPITargetAssignment;
using ERPEZ.Application.Features.Planning.DUKPITargetAssignment.Dtos;
using ERPEZ.Application.Features.Planning.DUKPITargetAssignment.Queries.GetDUKPITargetAssignmentById;
using ERPEZ.Application.Features.Planning.DUKPITargetAssignment.Queries.GetDUKPITargetAssignments;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers
{
    [Route("du-kpi-assignments")]
    [ApiController]
    public class DUKPITargetAssignmentController(ISender mediator) : ControllerBase
    {
        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<DUKPITargetAssignmentResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetKPIAssignments([FromQuery] GetDUKPITargetAssignmentsQuery query)
        {
            var result = await mediator.Send(query);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<DUKPITargetAssignmentResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetKPIAssignmentById(Guid id)
        {
            var result = await mediator.Send(new GetDUKPITargetAssignmentByIdQuery(id));
            return result.Succeeded ? Ok(result) : NotFound(result);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteKPIAssignment(Guid id)
        {
            var command = new DeleteDUKPITargetAssignmentCommand(id);
            var result = await mediator.Send(command);

            return result.Succeeded ? NoContent() : BadRequest(result);
        }
    }
}
