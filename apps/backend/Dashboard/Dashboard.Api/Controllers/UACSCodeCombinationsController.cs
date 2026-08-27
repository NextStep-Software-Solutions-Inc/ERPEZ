using ERPEZ.Application.Features.Planning.UACSCodeCombination.Commands.CreateUACSCodeCombination;
using ERPEZ.Application.Features.Planning.UACSCodeCombination.Commands.DeleteUACSCodeCombination;
using ERPEZ.Application.Features.Planning.UACSCodeCombination.Commands.UpdateUACSCodeCombination;
using ERPEZ.Application.Features.Planning.UACSCodeCombination.Dtos;
using ERPEZ.Application.Features.Planning.UACSCodeCombination.Queries.GetUACSCodeCombinationById;
using ERPEZ.Application.Features.Planning.UACSCodeCombination.Queries.GetUACSCodeCombinations;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers
{
    [Route("uacs-code-combinations")]
    [ApiController]
    [Authorize]
    public class UACSCodeCombinationsController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [HasPermission(Permissions.Finance.uacsManage)]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> CreateUACSCodeCombination([FromBody] CreateUACSCodeCombinationCommand command)
        {
            var response = await mediator.Send(command);

            if (!response.Succeeded)
                return BadRequest(response);

            return CreatedAtAction(nameof(GetUACSCodeCombinationById), new { id = response.Data }, response);
        }

        [HttpGet]
        [HasPermission(Permissions.Finance.uacsView)]
        [ProducesResponseType(typeof(PaginatedApiResponse<UACSCodeCombinationResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetUACSCodeCombinations([FromQuery] GetUACSCodeCombinationsQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [HasPermission(Permissions.Finance.uacsView)]
        [ProducesResponseType(typeof(ApiResponse<UACSCodeCombinationResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetUACSCodeCombinationById(Guid id)
        {
            var response = await mediator.Send(new GetUACSCodeCombinationByIdQuery(id));
            return response.Succeeded ? Ok(response) : BadRequest(response);
        }

        [HttpPut("{id}")]
        [HasPermission(Permissions.Finance.uacsManage)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> UpdateUACSCodeCombination(Guid id, [FromBody] UpdateUACSCodeCombinationRequest updateUACSCodeCombination)
        {
            var request = new UpdateUACSCodeCombinationCommand
            {
                Id = id,
                UpdateUACSCodeCombination = updateUACSCodeCombination
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
        public async Task<IActionResult> DeleteUACSCodeCombination(Guid id)
        {
            var command = new DeleteUACSCodeCombinationCommand(id);
            var response = await mediator.Send(command);

            return response.Succeeded ? Ok(response) : BadRequest(response);
        }
    }
}
