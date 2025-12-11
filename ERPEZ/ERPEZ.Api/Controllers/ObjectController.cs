using ERPEZ.Application.Features.Planning.Object.Commands.CreateObject;
using ERPEZ.Application.Features.Planning.Object.Commands.DeleteObject;
using ERPEZ.Application.Features.Planning.Object.Commands.UpdateObject;
using ERPEZ.Application.Features.Planning.Object.Dtos;
using ERPEZ.Application.Features.Planning.Object.Queries.GetObjectById;
using ERPEZ.Application.Features.Planning.Object.Queries.GetObjects;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers
{
    // Sets the route to 'objects'
    [Route("objects")]
    [ApiController]
    // Uses primary constructor injection for ISender (MediatR)
    public class ObjectController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<ObjectResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<ObjectResponse>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateObject([FromBody] CreateObjectCommand command)
        {
            var result = await mediator.Send(command);

            if (!result.Succeeded)
                return BadRequest(result);

            // Returns 201 Created and links to the GetById endpoint
            return CreatedAtAction(nameof(GetObjectById), new { id = result.Data!.Id }, result);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<Domain.Entities.Planning.Object>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetObjects([FromQuery] GetObjectsQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<Domain.Entities.Planning.Object>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetObjectById(Guid id)
        {
            var result = await mediator.Send(new GetObjectByIdQuery(id));

            return result.Succeeded ? Ok(result) : NotFound(result);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<ObjectResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateObject(Guid id, [FromBody] UpdateObjectRequest dto)
        {
            var command = new UpdateObjectCommand
            {
                Id = id,
                UpdateObject = dto
            };

            var result = await mediator.Send(command);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteObject(Guid id)
        {
            var command = new DeleteObjectCommand(id);
            var result = await mediator.Send(command);

            // Returns 204 No Content on successful deletion
            return result.Succeeded ? NoContent() : NotFound(result);
        }
    }
}
