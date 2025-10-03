using ERPEZ.Application.Common;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.TenantManagement.Application.Common;
using ERPEZ.TenantManagement.Application.Features.Locations.Commands.CreateLocation;
using ERPEZ.TenantManagement.Application.Features.Locations.Commands.DeleteLocation;
using ERPEZ.TenantManagement.Application.Features.Locations.Commands.UpdateLocation;
using ERPEZ.TenantManagement.Application.Features.Locations.Dtos;
using ERPEZ.TenantManagement.Application.Features.Locations.Queries.GetLocationById;
using ERPEZ.TenantManagement.Application.Features.Locations.Queries.GetLocations;
using ERPEZ.TenantManagement.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.TenantManagement.Api.Controllers
{
    [Route("locations")]
    [ApiController]
    public class LocationsController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<Location>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<Location>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateLocation([FromBody] CreateLocationCommand command)
        {
            var location = await mediator.Send(command);

            if (!location.Succeeded)
                return BadRequest(location);

            return CreatedAtAction(nameof(GetLocationById), new { id = location.Data!.Id }, location);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<LocationDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetLocations([FromQuery] GetLocationsQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<LocationDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetLocationById(Guid id)
        {
            var location = await mediator.Send(new GetLocationByIdQuery(id));
            if (location == null)
                return NotFound(ApiResponse<LocationDto>.Fail("Location not found."));

            return location.Succeeded ? Ok(location) : BadRequest(location);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateLocation(Guid id, [FromBody] UpdateLocationDto updateLocation)
        {
            var request = new UpdateLocationCommand
            {
                Id = id,
                UpdateLocation = updateLocation
            };

            if (id != request.Id)
                return BadRequest(ApiResponse<Location>.Fail("ID mismatch."));

            var location = await mediator.Send(request);
            return location.Succeeded ? Ok(location) : BadRequest(location);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteLocation(Guid id)
        {
            var command = new DeleteLocationCommand(id);
            var location = await mediator.Send(command);

            return location.Succeeded ? Ok(location) : BadRequest(location);
        }
    }
}
