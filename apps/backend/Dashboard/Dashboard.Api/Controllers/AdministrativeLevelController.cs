using ERPEZ.Application.Features.Planning.AdministrativeLevel.Commands.CreateAdministrativeLevel;
using ERPEZ.Application.Features.Planning.AdministrativeLevel.Commands.DeleteAdministrativeLevel;
using ERPEZ.Application.Features.Planning.AdministrativeLevel.Commands.UpdateAdministrativeLevel;
using ERPEZ.Application.Features.Planning.AdministrativeLevel.Dtos;
using ERPEZ.Application.Features.Planning.AdministrativeLevel.Queries.GetAdministrativeLevelById;
using ERPEZ.Application.Features.Planning.AdministrativeLevel.Queries.GetAdministrativeLevels;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("administrative-levels")]
[ApiController]
[Authorize]
public class AdministrativeLevelController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [HasPermission(Permissions.Admin.orgStructureManage)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateAdministrativeLevel([FromBody] CreateAdministrativeLevelCommand command)
    {
        var result = await mediator.Send(command);
        return !result.Succeeded ? BadRequest(result) : CreatedAtAction(nameof(GetAdministrativeLevelById), new { id = result.Data }, result);
    }

    [HttpGet]
    [HasPermission(Permissions.Admin.orgStructureView)]
    [ProducesResponseType(typeof(PaginatedApiResponse<AdministrativeLevelResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetAdministrativeLevels([FromQuery] GetAdministrativeLevelsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [HasPermission(Permissions.Admin.orgStructureView)]
    [ProducesResponseType(typeof(ApiResponse<AdministrativeLevelResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetAdministrativeLevelById(Guid id)
    {
        var result = await mediator.Send(new GetAdministrativeLevelByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [HasPermission(Permissions.Admin.orgStructureManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateAdministrativeLevel(Guid id, [FromBody] UpdateAdministrativeLevelRequest dto)
    {
        var command = new UpdateAdministrativeLevelCommand { Id = id, UpdateAdministrativeLevel = dto };
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [HasPermission(Permissions.Admin.orgStructureManage)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteAdministrativeLevel(Guid id)
    {
        var result = await mediator.Send(new DeleteAdministrativeLevelCommand(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }
}
