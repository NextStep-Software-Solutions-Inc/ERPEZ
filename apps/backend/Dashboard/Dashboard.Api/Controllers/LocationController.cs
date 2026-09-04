using ERPEZ.Application.Features.Planning.Location.Commands.CreateLocation;
using ERPEZ.Application.Features.Planning.Location.Commands.DeleteLocation;
using ERPEZ.Application.Features.Planning.Location.Commands.UpdateLocation;
using ERPEZ.Application.Features.Planning.Location.Dtos;
using ERPEZ.Application.Features.Planning.Location.Queries.GetLocationById;
using ERPEZ.Application.Features.Planning.Location.Queries.GetLocations;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers
{
    [Route("locations")]
    [ApiController]
    [Authorize]
    public class LocationsController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [HasPermission(Permissions.Admin.orgStructureManage)]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> CreateLocation([FromBody] CreateLocationCommand command)
        {
            var location = await mediator.Send(command);

            if (!location.Succeeded)
                return BadRequest(location);

            return CreatedAtAction(nameof(GetLocationById), new { id = location.Data }, location);
        }

        [HttpGet]
        [HasPermission(Permissions.Admin.orgStructureView)]
        [ProducesResponseType(typeof(PaginatedApiResponse<LocationResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetLocations([FromQuery] GetLocationsQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [HasPermission(Permissions.Admin.orgStructureView)]
        [ProducesResponseType(typeof(ApiResponse<LocationDetailedResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetLocationById(Guid id)
        {
            var location = await mediator.Send(new GetLocationByIdQuery(id));

            return location.Succeeded ? Ok(location) : BadRequest(location);
        }

        [HttpPut("{id}")]
        [HasPermission(Permissions.Admin.orgStructureManage)]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> UpdateLocation(Guid id, [FromBody] UpdateLocationRequest updateLocation)
        {
            var request = new UpdateLocationCommand
            {
                Id = id,
                UpdateLocation = updateLocation
            };

            var location = await mediator.Send(request);
            return location.Succeeded ? Ok(ApiResponse<Unit>.Success(Unit.Value)) : BadRequest(location);
        }

        [HttpDelete("{id}")]
        [HasPermission(Permissions.Admin.orgStructureManage)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> DeleteLocation(Guid id)
        {
            var command = new DeleteLocationCommand(id);
            var location = await mediator.Send(command);

            return location.Succeeded ? NoContent() : NotFound();
        }
    }
}
