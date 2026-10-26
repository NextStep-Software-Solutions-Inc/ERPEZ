using ERPEZ.Application.Features.Planning.ProcurementMode.Commands.ArchiveProcurementMode;
using ERPEZ.Application.Features.Planning.ProcurementMode.Commands.CreateProcurementMode;
using ERPEZ.Application.Features.Planning.ProcurementMode.Commands.DeleteProcurementMode;
using ERPEZ.Application.Features.Planning.ProcurementMode.Commands.UnarchiveProcurementMode;
using ERPEZ.Application.Features.Planning.ProcurementMode.Commands.UpdateProcurementMode;
using ERPEZ.Application.Features.Planning.ProcurementMode.Dtos;
using ERPEZ.Application.Features.Planning.ProcurementMode.Queries.GetProcurementModeById;
using ERPEZ.Application.Features.Planning.ProcurementMode.Queries.GetProcurementModes;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Sieve.Models;

namespace ERPEZ.Api.Controllers;

[Route("procurement-modes")]
[ApiController]
[Authorize]
public class ProcurementModeController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Create a new procurement mode
    /// </summary>
    [HttpPost]
    [HasPermission(Permissions.Procurement.procurementLibraryManage)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateProcurementMode([FromBody] CreateProcurementModeCommand command)
    {
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetProcurementModeById), new { id = result.Data }, result);
    }

    /// <summary>
    /// Get all procurement modes with filtering, sorting, and pagination
    /// </summary>
    [HttpGet]
    [HasPermission(Permissions.Procurement.procurementLibraryView)]
    [ProducesResponseType(typeof(PaginatedApiResponse<ProcurementModeResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetProcurementModes([FromQuery] SieveModel sieveModel)
    {
        var query = new GetProcurementModesQuery(sieveModel);
        var result = await mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get procurement mode by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.Procurement.procurementLibraryView)]
    [ProducesResponseType(typeof(ApiResponse<ProcurementModeResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<ProcurementModeResponse>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetProcurementModeById(Guid id)
    {
        var query = new GetProcurementModeByIdQuery(id);
        var result = await mediator.Send(query);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Update an existing procurement mode
    /// </summary>
    [HttpPut("{id:guid}")]
    [HasPermission(Permissions.Procurement.procurementLibraryManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateProcurementMode(Guid id, [FromBody] UpdateProcurementModeCommand command)
    {
        if (id != command.Id)
        {
            command = command with { Id = id };
        }

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Delete a procurement mode
    /// </summary>
    [HttpDelete("{id:guid}")]
    [HasPermission(Permissions.Procurement.procurementLibraryManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteProcurementMode(Guid id)
    {
        var command = new DeleteProcurementModeCommand(id);
        var result = await mediator.Send(command);
        return result.Succeeded ? NoContent() : NotFound(result);
    }

    /// <summary>
    /// Archive a procurement mode
    /// </summary>
    [HttpPost("{id:guid}/archive")]
    [HasPermission(Permissions.Procurement.procurementLibraryManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ArchiveProcurementMode(Guid id)
    {
        var command = new ArchiveProcurementModeCommand(id);
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Unarchive a procurement mode
    /// </summary>
    [HttpPost("{id:guid}/unarchive")]
    [HasPermission(Permissions.Procurement.procurementLibraryManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UnarchiveProcurementMode(Guid id)
    {
        var command = new UnarchiveProcurementModeCommand(id);
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }
}
