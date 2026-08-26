using ERPEZ.Application.Features.Planning.Budgeting.OfficeCeiling.Commands.CreateOfficeCeiling;
using ERPEZ.Application.Features.Planning.Budgeting.OfficeCeiling.Commands.DeleteOfficeCeiling;
using ERPEZ.Application.Features.Planning.Budgeting.OfficeCeiling.Commands.UpdateOfficeCeiling;
using ERPEZ.Application.Features.Planning.Budgeting.OfficeCeiling.Dtos;
using ERPEZ.Application.Features.Planning.Budgeting.OfficeCeiling.Queries.GetOfficeCeilingById;
using ERPEZ.Application.Features.Planning.Budgeting.OfficeCeiling.Queries.GetOfficeCeilings;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("office-ceilings")]
[ApiController]
public class OfficeCeilingController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [HasPermission(Permissions.Finance.budgetCeilingAssign)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateOfficeCeiling([FromBody] CreateOfficeCeilingRequest request)
    {
        var result = await mediator.Send(new CreateOfficeCeilingCommand(request));
        return result.Succeeded
            ? CreatedAtAction(nameof(GetOfficeCeilingById), new { id = result.Data }, result)
            : BadRequest(result);
    }

    [HttpGet]
    [HasPermission(Permissions.Finance.budgetCeilingAssign)]
    [ProducesResponseType(typeof(PaginatedApiResponse<OfficeCeilingResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetOfficeCeilings([FromQuery] GetOfficeCeilingsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [HasPermission(Permissions.Finance.budgetCeilingAssign)]
    [ProducesResponseType(typeof(ApiResponse<OfficeCeilingResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetOfficeCeilingById(Guid id)
    {
        var result = await mediator.Send(new GetOfficeCeilingByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [HasPermission(Permissions.Finance.budgetCeilingAssign)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateOfficeCeiling(Guid id, [FromBody] UpdateOfficeCeilingRequest request)
    {
        var command = new UpdateOfficeCeilingCommand(id, request);
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [HasPermission(Permissions.Finance.budgetCeilingAssign)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteOfficeCeiling(Guid id)
    {
        var result = await mediator.Send(new DeleteOfficeCeilingCommand(id));
        return result.Succeeded ? NoContent() : NotFound();
    }
}
