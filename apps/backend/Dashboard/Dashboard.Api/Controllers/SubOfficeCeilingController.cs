using ERPEZ.Application.Features.Planning.Budgeting.SubOfficeCeiling.Commands.CreateSubOfficeCeiling;
using ERPEZ.Application.Features.Planning.Budgeting.SubOfficeCeiling.Commands.DeleteSubOfficeCeiling;
using ERPEZ.Application.Features.Planning.Budgeting.SubOfficeCeiling.Commands.UpdateSubOfficeCeiling;
using ERPEZ.Application.Features.Planning.Budgeting.SubOfficeCeiling.Dtos;
using ERPEZ.Application.Features.Planning.Budgeting.SubOfficeCeiling.Queries.GetSubOfficeCeilingById;
using ERPEZ.Application.Features.Planning.Budgeting.SubOfficeCeiling.Queries.GetSubOfficeCeilings;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("sub-office-ceilings")]
[ApiController]
[Authorize]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
[ProducesResponseType(StatusCodes.Status403Forbidden)]
public class SubOfficeCeilingController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [HasPermission(Permissions.Finance.subOfficeCeilingAssign)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateSubOfficeCeiling([FromBody] CreateSubOfficeCeilingRequest request)
    {
        var result = await mediator.Send(new CreateSubOfficeCeilingCommand(request));
        return result.Succeeded
            ? CreatedAtAction(nameof(GetSubOfficeCeilingById), new { id = result.Data }, result)
            : BadRequest(result);
    }

    [HttpGet]
    [HasPermission(Permissions.Finance.uacsView)]
    [ProducesResponseType(typeof(PaginatedApiResponse<SubOfficeCeilingResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSubOfficeCeilings([FromQuery] GetSubOfficeCeilingsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [HasPermission(Permissions.Finance.uacsView)]
    [ProducesResponseType(typeof(ApiResponse<SubOfficeCeilingResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSubOfficeCeilingById(Guid id)
    {
        var result = await mediator.Send(new GetSubOfficeCeilingByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [HasPermission(Permissions.Finance.subOfficeCeilingAssign)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateSubOfficeCeiling(Guid id, [FromBody] UpdateSubOfficeCeilingRequest request)
    {
        var result = await mediator.Send(new UpdateSubOfficeCeilingCommand(id, request));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [HasPermission(Permissions.Finance.subOfficeCeilingAssign)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteSubOfficeCeiling(Guid id)
    {
        var result = await mediator.Send(new DeleteSubOfficeCeilingCommand(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }
}
