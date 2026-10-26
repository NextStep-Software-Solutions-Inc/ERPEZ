using ERPEZ.Application.Features.Planning.UACSCodeCombinationFiscalYear.Commands.CreateUACSCodeCombinationFiscalYear;
using ERPEZ.Application.Features.Planning.UACSCodeCombinationFiscalYear.Commands.DeleteUACSCodeCombinationFiscalYear;
using ERPEZ.Application.Features.Planning.UACSCodeCombinationFiscalYear.Commands.UpdateUACSCodeCombinationFiscalYear;
using ERPEZ.Application.Features.Planning.UACSCodeCombinationFiscalYear.Dtos;
using ERPEZ.Application.Features.Planning.UACSCodeCombinationFiscalYear.Queries.GetUACSCodeCombinationFiscalYearById;
using ERPEZ.Application.Features.Planning.UACSCodeCombinationFiscalYear.Queries.GetUACSCodeCombinationFiscalYears;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

/// <summary>
/// Controller for managing UACS code combination fiscal year associations.
/// </summary>
[Route("uacs-code-combination-fiscal-years")]
[ApiController]
[Authorize]
public class UACSCodeCombinationFiscalYearController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Creates a new UACS code combination fiscal year association.
    /// </summary>
    [HttpPost]
    [HasPermission(Permissions.Finance.uacsManage)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateUACSCodeCombinationFiscalYear([FromBody] CreateUACSCodeCombinationFiscalYearCommand command)
    {
        var result = await mediator.Send(command);
        return !result.Succeeded ? BadRequest(result) : CreatedAtAction(nameof(GetUACSCodeCombinationFiscalYearById), new { id = result.Data }, result);
    }

    /// <summary>
    /// Retrieves all UACS code combination fiscal year associations with pagination and filtering.
    /// </summary>
    [HttpGet]
    [HasPermission(Permissions.Finance.uacsView)]
    [ProducesResponseType(typeof(PaginatedApiResponse<UACSCodeCombinationFiscalYearResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetUACSCodeCombinationFiscalYears([FromQuery] GetUACSCodeCombinationFiscalYearsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Retrieves a single UACS code combination fiscal year association by ID.
    /// </summary>
    [HttpGet("{id}")]
    [HasPermission(Permissions.Finance.uacsView)]
    [ProducesResponseType(typeof(ApiResponse<UACSCodeCombinationFiscalYearResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetUACSCodeCombinationFiscalYearById(Guid id)
    {
        var result = await mediator.Send(new GetUACSCodeCombinationFiscalYearByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Updates an existing UACS code combination fiscal year association.
    /// </summary>
    [HttpPut("{id}")]
    [HasPermission(Permissions.Finance.uacsManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateUACSCodeCombinationFiscalYear(Guid id, [FromBody] UpdateUACSCodeCombinationFiscalYearRequest dto)
    {
        var command = new UpdateUACSCodeCombinationFiscalYearCommand
        {
            Id = id,
            UpdateUACSCodeCombinationFiscalYear = dto
        };

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Deletes a UACS code combination fiscal year association.
    /// </summary>
    [HttpDelete("{id}")]
    [HasPermission(Permissions.Finance.uacsManage)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteUACSCodeCombinationFiscalYear(Guid id)
    {
        var result = await mediator.Send(new DeleteUACSCodeCombinationFiscalYearCommand(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }
}
