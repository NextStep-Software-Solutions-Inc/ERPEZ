using ERPEZ.Application.Features.Planning.ObjectChildCode.Commands.CreateObjectChildCode;
using ERPEZ.Application.Features.Planning.ObjectChildCode.Commands.DeleteObjectChildCode;
using ERPEZ.Application.Features.Planning.ObjectChildCode.Dtos;
using ERPEZ.Application.Features.Planning.ObjectChildCode.Queries.GetAncestors;
using ERPEZ.Application.Features.Planning.ObjectChildCode.Queries.GetDescendants;
using ERPEZ.Application.Features.Planning.ObjectChildCode.Queries.GetObjectHierarchy;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

/// <summary>
/// Controller for Object child code hierarchy operations.
/// </summary>
[Route("objects")]
[ApiController]
[Authorize]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
[ProducesResponseType(StatusCodes.Status403Forbidden)]
public class ObjectChildCodeController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Creates a new child code relationship for an object.
    /// </summary>
    [HttpPost("{id}/child-codes")]
    [HasPermission(Permissions.Finance.uacsManage)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateChildCode(Guid id, [FromBody] CreateObjectChildCodeCommand command)
    {
        if (id != command.ParentObjectId)
        {
            return BadRequest(ApiResponse<Guid>.Fail("Parent Object ID in URL must match command."));
        }

        var response = await mediator.Send(command);
        return response.Succeeded ? CreatedAtAction(nameof(GetHierarchy), new { id }, response) : BadRequest(response);
    }

    /// <summary>
    /// Gets the full hierarchy tree for an object.
    /// </summary>
    [HttpGet("{id}/hierarchy")]
    [HasPermission(Permissions.Finance.uacsView)]
    [ProducesResponseType(typeof(ApiResponse<ObjectHierarchyNode>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetHierarchy(Guid id)
    {
        var response = await mediator.Send(new GetObjectHierarchyQuery(id));
        return response.Succeeded ? Ok(response) : NotFound(response);
    }

    /// <summary>
    /// Gets all descendants of an object.
    /// </summary>
    [HttpGet("{id}/descendants")]
    [HasPermission(Permissions.Finance.uacsView)]
    [ProducesResponseType(typeof(ApiResponse<List<ObjectChildCodeResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDescendants(Guid id)
    {
        var response = await mediator.Send(new GetDescendantsQuery(id));
        return Ok(response);
    }

    /// <summary>
    /// Gets all ancestors (parent chain) of an object.
    /// </summary>
    [HttpGet("{id}/ancestors")]
    [HasPermission(Permissions.Finance.uacsView)]
    [ProducesResponseType(typeof(ApiResponse<List<ObjectChildCodeResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAncestors(Guid id)
    {
        var response = await mediator.Send(new GetAncestorsQuery(id));
        return Ok(response);
    }

    /// <summary>
    /// Deletes a child code relationship.
    /// </summary>
    [HttpDelete("{id}/child-codes/{childId}")]
    [HasPermission(Permissions.Finance.uacsManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteChildCode(Guid id, Guid childId)
    {
        var response = await mediator.Send(new DeleteObjectChildCodeCommand(childId));
        return response.Succeeded ? Ok(response) : NotFound(response);
    }
}
