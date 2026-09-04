using Microsoft.AspNetCore.Authorization;
using ERPEZ.Shared.Constants;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using ERPEZ.Application.Features.Planning.WFP.Commands.CreateWFP;
using ERPEZ.Application.Features.Planning.WFP.Dtos;
using ERPEZ.Application.Features.Planning.WFP.Queries.GetWFPs;
using ERPEZ.Application.Features.Planning.WFP.Queries.GetWFPById;
using ERPEZ.Application.Features.Planning.WFP.Commands.UpdateWFP;
using ERPEZ.Application.Features.Planning.WFP.Commands.DeleteWFP;
using ERPEZ.Application.Features.Planning.WFP.Commands.UpdateWFPStatus;

namespace ERPEZ.Api.Controllers
{
    [Route("wfps")]
    [ApiController]
    [Authorize]
public class WFPController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
        [HasPermission(Permissions.Planning.wfpCreate)]
        public async Task<IActionResult> CreateWFP([FromBody] CreateWFPCommand command)
        {
            var result = await mediator.Send(command);

            if (!result.Succeeded)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetWFPById), new { id = result.Data }, result);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<WFPsResponse>), StatusCodes.Status200OK)]
        [HasPermission(Permissions.Planning.wfpView)]
        public async Task<IActionResult> GetWFPs([FromQuery] GetWFPsQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<WFPsDetailedResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HasPermission(Permissions.Planning.wfpView)]
        public async Task<IActionResult> GetWFPById(Guid id)
        {
            var result = await mediator.Send(new GetWFPByIdQuery(id));
            return result.Succeeded ? Ok(result) : NotFound(result);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HasPermission(Permissions.Planning.wfpUpdate)]
        public async Task<IActionResult> UpdateWFP(Guid id, [FromBody] UpdateWFPRequest dto)
        {
            var command = new UpdateWFPCommand
            {
                Id = id,
                UpdateWFP = dto
            };

            var result = await mediator.Send(command);
            return result.Succeeded ? Ok(ApiResponse<Unit>.Success(Unit.Value)) : BadRequest(result);
        }

        [HttpPatch("{id}/status")]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HasPermission(Permissions.Planning.wfpSubmit)]
        public async Task<IActionResult> UpdateWFPStatus(Guid id, [FromBody] UpdateWFPStatusRequest request)
        {
            var command = new UpdateWFPStatusCommand
            {
                Id = id,
                Status = request.Status
            };

            var result = await mediator.Send(command);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HasPermission(Permissions.Planning.wfpDelete)]
        public async Task<IActionResult> DeleteWFP(Guid id)
        {
            var command = new DeleteWFPCommand(id);
            var result = await mediator.Send(command);

            return result.Succeeded ? NoContent() : NotFound();
        }
    }
}
