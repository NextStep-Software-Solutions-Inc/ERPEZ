using ERPEZ.Application.Features.Planning.Location.Commands.CreateLocation;
using ERPEZ.Application.Features.Planning.Location.Commands.DeleteLocation;
using ERPEZ.Application.Features.Planning.Location.Commands.UpdateLocation;
using ERPEZ.Application.Features.Planning.Location.Dtos;
using ERPEZ.Application.Features.Planning.Location.Queries.GetLocationById;
using ERPEZ.Application.Features.Planning.Location.Queries.GetLocations;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers
{
    [Route("locations")]
    [ApiController]
    public class LocationsController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateLocation([FromBody] CreateLocationCommand command)
        {
            var location = await mediator.Send(command);

            if (!location.Succeeded)
                return BadRequest(location);

            return CreatedAtAction(nameof(GetLocationById), new { id = location.Data }, location);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<LocationResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetLocations([FromQuery] GetLocationsQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<LocationDetailedResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetLocationById(Guid id)
        {
            var location = await mediator.Send(new GetLocationByIdQuery(id));

            return location.Succeeded ? Ok(location) : BadRequest(location);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
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
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteLocation(Guid id)
        {
            var command = new DeleteLocationCommand(id);
            var location = await mediator.Send(command);

            return location.Succeeded ? NoContent() : NotFound();
        }
    }
}
