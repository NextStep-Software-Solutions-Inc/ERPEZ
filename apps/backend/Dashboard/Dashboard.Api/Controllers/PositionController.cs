using ERPEZ.Application.Features.Planning.Position.Commands.CreatePosition;
using ERPEZ.Application.Features.Planning.Position.Commands.DeletePosition;
using ERPEZ.Application.Features.Planning.Position.Commands.UpdatePosition;
using ERPEZ.Application.Features.Planning.Position.Commands.UploadPositionPSI;
using ERPEZ.Application.Features.Planning.Position.Dtos;
using ERPEZ.Application.Features.Planning.Position.Queries.GetPositionById;
using ERPEZ.Application.Features.Planning.Position.Queries.GetPositions;
using ERPEZ.Application.Features.Planning.Position.Queries.GetPositionStatistics;
using ERPEZ.Application.Interfaces;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("positions")]
[ApiController]
[Authorize]
public class PositionController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [HasPermission(Permissions.Admin.orgStructureManage)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreatePosition([FromBody] CreatePositionCommand command)
    {
        var result = await mediator.Send(command);
        return !result.Succeeded ? BadRequest(result) : CreatedAtAction(nameof(GetPositionById), new { id = result.Data }, result);
    }

    [HttpGet]
    [HasPermission(Permissions.Admin.orgStructureView)]
    [ProducesResponseType(typeof(PaginatedApiResponse<PositionResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetPositions([FromQuery] GetPositionsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [HasPermission(Permissions.Admin.orgStructureView)]
    [ProducesResponseType(typeof(ApiResponse<PositionResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetPositionById(Guid id)
    {
        var result = await mediator.Send(new GetPositionByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [HasPermission(Permissions.Admin.orgStructureManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdatePosition(Guid id, [FromBody] UpdatePositionRequest updatePosition)
    {
        var request = new UpdatePositionCommand
        {
            Id = id,
            UpdatePosition = updatePosition
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
    public async Task<IActionResult> DeletePosition(Guid id)
    {
        var result = await mediator.Send(new DeletePositionCommand(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpGet("statistics")]
    [HasPermission(Permissions.Admin.orgStructureView)]
    [ProducesResponseType(typeof(ApiResponse<PositionStatisticsResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetPositionStatistics()
    {
        var result = await mediator.Send(new GetPositionStatisticsQuery());
        return Ok(result);
    }

    [HttpPost("upload-psi")]
    [HasPermission(Permissions.Admin.orgStructureManage)]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(ApiResponse<PositionImportResult>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<PositionImportResult>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UploadPositionPSI([FromForm] UploadPositionPSICommand command)
    {
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }
}
