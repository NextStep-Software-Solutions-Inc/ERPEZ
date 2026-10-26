using ERPEZ.Application.Features.Planning.UNSPSCCode.Commands.CreateUNSPSCCode;
using ERPEZ.Application.Features.Planning.UNSPSCCode.Commands.DeleteUNSPSCCode;
using ERPEZ.Application.Features.Planning.UNSPSCCode.Commands.UpdateUNSPSCCode;
using ERPEZ.Application.Features.Planning.UNSPSCCode.Dtos;
using ERPEZ.Application.Features.Planning.UNSPSCCode.Queries.GetUNSPSCCodeById;
using ERPEZ.Application.Features.Planning.UNSPSCCode.Queries.GetUNSPSCCodes;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Sieve.Models;

namespace ERPEZ.Api.Controllers;

[Route("unspsc-codes")]
[ApiController]
[Authorize]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
[ProducesResponseType(StatusCodes.Status403Forbidden)]
public class UNSPSCCodeController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Create a new UNSPSC code
    /// </summary>
    [HttpPost]
    [HasPermission(Permissions.Procurement.procurementLibraryManage)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateUNSPSCCode([FromBody] CreateUNSPSCCodeCommand command)
    {
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetUNSPSCCodeById), new { id = result.Data }, result);
    }

    /// <summary>
    /// Get all UNSPSC codes with filtering, sorting, and pagination
    /// </summary>
    [HttpGet]
    [HasPermission(Permissions.Procurement.procurementLibraryView)]
    [ProducesResponseType(typeof(PaginatedApiResponse<UNSPSCCodeResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUNSPSCCodes([FromQuery] SieveModel sieveModel)
    {
        var query = new GetUNSPSCCodesQuery(sieveModel);
        var result = await mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get UNSPSC code by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.Procurement.procurementLibraryView)]
    [ProducesResponseType(typeof(ApiResponse<UNSPSCCodeResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<UNSPSCCodeResponse>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUNSPSCCodeById(Guid id)
    {
        var query = new GetUNSPSCCodeByIdQuery(id);
        var result = await mediator.Send(query);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Update an existing UNSPSC code
    /// </summary>
    [HttpPut("{id:guid}")]
    [HasPermission(Permissions.Procurement.procurementLibraryManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateUNSPSCCode(Guid id, [FromBody] UpdateUNSPSCCodeCommand command)
    {
        if (id != command.Id)
        {
            command = command with { Id = id };
        }

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Delete a UNSPSC code
    /// </summary>
    [HttpDelete("{id:guid}")]
    [HasPermission(Permissions.Procurement.procurementLibraryManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteUNSPSCCode(Guid id)
    {
        var command = new DeleteUNSPSCCodeCommand(id);
        var result = await mediator.Send(command);
        return result.Succeeded ? NoContent() : NotFound(result);
    }
}
