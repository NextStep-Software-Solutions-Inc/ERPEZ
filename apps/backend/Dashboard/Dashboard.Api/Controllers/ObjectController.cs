using ERPEZ.Application.Features.Planning.Object.Commands.CreateObject;
using ERPEZ.Application.Features.Planning.Object.Commands.DeleteObject;
using ERPEZ.Application.Features.Planning.Object.Commands.UpdateObject;
using ERPEZ.Application.Features.Planning.Object.Dtos;
using ERPEZ.Application.Features.Planning.Object.Queries.GetObjectById;
using ERPEZ.Application.Features.Planning.Object.Queries.GetObjects;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers
{
    // Sets the route to 'objects'
    [Route("objects")]
    [ApiController]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    // Uses primary constructor injection for ISender (MediatR)
    public class ObjectController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [HasPermission(Permissions.Finance.uacsManage)]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateObject([FromBody] CreateObjectCommand command)
        {
            var result = await mediator.Send(command);

            if (!result.Succeeded)
                return BadRequest(result);

            // Returns 201 Created and links to the GetById endpoint
            return CreatedAtAction(nameof(GetObjectById), new { id = result.Data }, result);
        }

        [HttpGet]
        [HasPermission(Permissions.Finance.uacsView)]
        [ProducesResponseType(typeof(PaginatedApiResponse<ObjectResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetObjects([FromQuery] GetObjectsQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [HasPermission(Permissions.Finance.uacsView)]
        [ProducesResponseType(typeof(ApiResponse<ObjectDetailedResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetObjectById(Guid id)
        {
            var result = await mediator.Send(new GetObjectByIdQuery(id));

            return result.Succeeded ? Ok(result) : NotFound(result);
        }

        [HttpPut("{id}")]
        [HasPermission(Permissions.Finance.uacsManage)]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
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
            return result.Succeeded ? Ok(ApiResponse<Unit>.Success(Unit.Value)) : BadRequest(result);
        }

        [HttpDelete("{id}")]
        [HasPermission(Permissions.Finance.uacsManage)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteObject(Guid id)
        {
            var command = new DeleteObjectCommand(id);
            var result = await mediator.Send(command);

            return result.Succeeded ? NoContent() : NotFound();
        }
    }
}
