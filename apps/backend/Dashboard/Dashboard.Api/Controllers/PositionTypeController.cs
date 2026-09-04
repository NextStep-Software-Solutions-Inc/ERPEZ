using ERPEZ.Application.Features.Planning.PositionType.Commands.CreatePositionType;
using ERPEZ.Application.Features.Planning.PositionType.Commands.DeletePositionType;
using ERPEZ.Application.Features.Planning.PositionType.Commands.UpdatePositionType;
using ERPEZ.Application.Features.Planning.PositionType.Dtos;
using ERPEZ.Application.Features.Planning.PositionType.Queries.GetPositionTypeById;
using ERPEZ.Application.Features.Planning.PositionType.Queries.GetPositionTypes;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("position-types")]
[ApiController]
[Authorize]
public class PositionTypeController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [HasPermission(Permissions.Admin.orgStructureManage)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreatePositionType([FromBody] CreatePositionTypeCommand command)
    {
        var result = await mediator.Send(command);
        return !result.Succeeded ? BadRequest(result) : CreatedAtAction(nameof(GetPositionTypeById), new { id = result.Data }, result);
    }

    [HttpGet]
    [HasPermission(Permissions.Admin.orgStructureView)]
    [ProducesResponseType(typeof(PaginatedApiResponse<PositionTypeResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetPositionTypes([FromQuery] GetPositionTypesQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [HasPermission(Permissions.Admin.orgStructureView)]
    [ProducesResponseType(typeof(ApiResponse<PositionTypeResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetPositionTypeById(Guid id)
    {
        var result = await mediator.Send(new GetPositionTypeByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [HasPermission(Permissions.Admin.orgStructureManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdatePositionType(Guid id, [FromBody] UpdatePositionTypeRequest updatePositionType)
    {
        var request = new UpdatePositionTypeCommand
        {
            Id = id,
            UpdatePositionType = updatePositionType
        };

        var result = await mediator.Send(request);
        return result.Succeeded ? Ok(ApiResponse<Unit>.Success(Unit.Value)) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [HasPermission(Permissions.Admin.orgStructureManage)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeletePositionType(Guid id)
    {
        var result = await mediator.Send(new DeletePositionTypeCommand(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }
}
