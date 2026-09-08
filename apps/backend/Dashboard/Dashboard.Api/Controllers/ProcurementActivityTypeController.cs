using ERPEZ.Application.Features.Planning.ProcurementActivityType.Commands.CreateProcurementActivityType;
using ERPEZ.Application.Features.Planning.ProcurementActivityType.Commands.DeleteProcurementActivityType;
using ERPEZ.Application.Features.Planning.ProcurementActivityType.Commands.UpdateProcurementActivityType;
using ERPEZ.Application.Features.Planning.ProcurementActivityType.Queries.GetProcurementActivityTypeById;
using ERPEZ.Application.Features.Planning.ProcurementActivityType.Queries.GetProcurementActivityTypes;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("procurement-activity-types")]
[ApiController]
[Authorize]
public class ProcurementActivityTypeController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [HasPermission(Permissions.Procurement.procurementLibraryManage)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateProcurementActivityType([FromBody] CreateProcurementActivityTypeCommand command)
    {
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetProcurementActivityTypeById), new { id = result.Data }, result);
    }

    [HttpGet]
    [HasPermission(Permissions.Procurement.procurementLibraryView)]
    [ProducesResponseType(typeof(PaginatedApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetProcurementActivityTypes(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? filters = null,
        [FromQuery] string? sorts = null)
    {
        var query = new GetProcurementActivityTypesQuery
        {
            Page = page,
            PageSize = pageSize,
            Filters = filters,
            Sorts = sorts
        };

        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [HasPermission(Permissions.Procurement.procurementLibraryView)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetProcurementActivityTypeById(Guid id)
    {
        var query = new GetProcurementActivityTypeByIdQuery(id);
        var result = await mediator.Send(query);

        if (!result.Succeeded)
            return NotFound(result);

        return Ok(result);
    }

    [HttpPut("{id}")]
    [HasPermission(Permissions.Procurement.procurementLibraryManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateProcurementActivityType(Guid id, [FromBody] UpdateProcurementActivityTypeCommand command)
    {
        var updateCommand = command with { Id = id };
        var result = await mediator.Send(updateCommand);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpDelete("{id}")]
    [HasPermission(Permissions.Procurement.procurementLibraryManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteProcurementActivityType(Guid id)
    {
        var command = new DeleteProcurementActivityTypeCommand(id);
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return NotFound(result);

        return Ok(result);
    }
}
