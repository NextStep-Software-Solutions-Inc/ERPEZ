using ERPEZ.Application.Features.Planning.PlantillaType.Commands.CreatePlantillaType;
using ERPEZ.Application.Features.Planning.PlantillaType.Commands.DeletePlantillaType;
using ERPEZ.Application.Features.Planning.PlantillaType.Commands.UpdatePlantillaType;
using ERPEZ.Application.Features.Planning.PlantillaType.Dtos;
using ERPEZ.Application.Features.Planning.PlantillaType.Queries.GetPlantillaTypeById;
using ERPEZ.Application.Features.Planning.PlantillaType.Queries.GetPlantillaTypes;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("plantilla-types")]
[ApiController]
[Authorize]
public class PlantillaTypeController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [HasPermission(Permissions.Admin.orgStructureManage)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreatePlantillaType([FromBody] CreatePlantillaTypeCommand command)
    {
        var result = await mediator.Send(command);
        return !result.Succeeded ? BadRequest(result) : CreatedAtAction(nameof(GetPlantillaTypeById), new { id = result.Data }, result);
    }

    [HttpGet]
    [HasPermission(Permissions.Admin.orgStructureView)]
    [ProducesResponseType(typeof(PaginatedApiResponse<PlantillaTypeResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetPlantillaTypes([FromQuery] GetPlantillaTypesQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [HasPermission(Permissions.Admin.orgStructureView)]
    [ProducesResponseType(typeof(ApiResponse<PlantillaTypeResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetPlantillaTypeById(Guid id)
    {
        var result = await mediator.Send(new GetPlantillaTypeByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [HasPermission(Permissions.Admin.orgStructureManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdatePlantillaType(Guid id, [FromBody] UpdatePlantillaTypeRequest updatePlantillaType)
    {
        var request = new UpdatePlantillaTypeCommand
        {
            Id = id,
            UpdatePlantillaType = updatePlantillaType
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
    public async Task<IActionResult> DeletePlantillaType(Guid id)
    {
        var result = await mediator.Send(new DeletePlantillaTypeCommand(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }
}
