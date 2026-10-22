using ERPEZ.Application.Features.Planning.UACSCodeSegment.Commands.CreateUACSCodeSegment;
using ERPEZ.Application.Features.Planning.UACSCodeSegment.Commands.DeleteUACSCodeSegment;
using ERPEZ.Application.Features.Planning.UACSCodeSegment.Commands.UpdateUACSCodeSegment;
using ERPEZ.Application.Features.Planning.UACSCodeSegment.Dtos;
using ERPEZ.Application.Features.Planning.UACSCodeSegment.Queries.GetUACSCodeSegmentById;
using ERPEZ.Application.Features.Planning.UACSCodeSegment.Queries.GetUACSCodeSegments;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers
{
    [Route("uacs-code-segments")]
    [ApiController]
    [Authorize]
    public class UACSCodeSegmentsController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [HasPermission(Permissions.Finance.uacsManage)]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> CreateUACSCodeSegment([FromBody] CreateUACSCodeSegmentCommand command)
        {
            var response = await mediator.Send(command);

            if (!response.Succeeded)
                return BadRequest(response);

            return CreatedAtAction(nameof(GetUACSCodeSegmentById), new { id = response.Data }, response);
        }

        [HttpGet]
        [HasPermission(Permissions.Finance.uacsView)]
        [ProducesResponseType(typeof(PaginatedApiResponse<UACSCodeSegmentResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetUACSCodeSegments([FromQuery] GetUACSCodeSegmentsQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [HasPermission(Permissions.Finance.uacsView)]
        [ProducesResponseType(typeof(ApiResponse<UACSCodeSegmentResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetUACSCodeSegmentById(Guid id)
        {
            var response = await mediator.Send(new GetUACSCodeSegmentByIdQuery(id));
            return response.Succeeded ? Ok(response) : BadRequest(response);
        }

        [HttpPut("{id}")]
        [HasPermission(Permissions.Finance.uacsManage)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> UpdateUACSCodeSegment(Guid id, [FromBody] UpdateUACSCodeSegmentRequest updateUACSCodeSegment)
        {
            var request = new UpdateUACSCodeSegmentCommand
            {
                Id = id,
                UpdateUACSCodeSegment = updateUACSCodeSegment
            };

            var response = await mediator.Send(request);
            return response.Succeeded ? Ok(response) : BadRequest(response);
        }

        [HttpDelete("{id}")]
        [HasPermission(Permissions.Finance.uacsManage)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> DeleteUACSCodeSegment(Guid id)
        {
            var command = new DeleteUACSCodeSegmentCommand(id);
            var response = await mediator.Send(command);

            return response.Succeeded ? Ok(response) : BadRequest(response);
        }
    }
}
