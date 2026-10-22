using ERPEZ.Application.Features.Planning.UACSCodeSegmentFiscalYear.Commands.CreateUACSCodeSegmentFiscalYear;
using ERPEZ.Application.Features.Planning.UACSCodeSegmentFiscalYear.Commands.DeleteUACSCodeSegmentFiscalYear;
using ERPEZ.Application.Features.Planning.UACSCodeSegmentFiscalYear.Commands.UpdateUACSCodeSegmentFiscalYear;
using ERPEZ.Application.Features.Planning.UACSCodeSegmentFiscalYear.Dtos;
using ERPEZ.Application.Features.Planning.UACSCodeSegmentFiscalYear.Queries.GetUACSCodeSegmentFiscalYearById;
using ERPEZ.Application.Features.Planning.UACSCodeSegmentFiscalYear.Queries.GetUACSCodeSegmentFiscalYears;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

/// <summary>
/// Controller for managing UACS code segment fiscal year associations.
/// </summary>
[Route("uacs-code-segment-fiscal-years")]
[ApiController]
[Authorize]
public class UACSCodeSegmentFiscalYearController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Creates a new UACS code segment fiscal year association.
    /// </summary>
    [HttpPost]
    [HasPermission(Permissions.Finance.uacsManage)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateUACSCodeSegmentFiscalYear([FromBody] CreateUACSCodeSegmentFiscalYearCommand command)
    {
        var result = await mediator.Send(command);
        return !result.Succeeded ? BadRequest(result) : CreatedAtAction(nameof(GetUACSCodeSegmentFiscalYearById), new { id = result.Data }, result);
    }

    /// <summary>
    /// Retrieves all UACS code segment fiscal year associations with pagination and filtering.
    /// </summary>
    [HttpGet]
    [HasPermission(Permissions.Finance.uacsView)]
    [ProducesResponseType(typeof(PaginatedApiResponse<UACSCodeSegmentFiscalYearResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetUACSCodeSegmentFiscalYears([FromQuery] GetUACSCodeSegmentFiscalYearsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Retrieves a single UACS code segment fiscal year association by ID.
    /// </summary>
    [HttpGet("{id}")]
    [HasPermission(Permissions.Finance.uacsView)]
    [ProducesResponseType(typeof(ApiResponse<UACSCodeSegmentFiscalYearResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetUACSCodeSegmentFiscalYearById(Guid id)
    {
        var result = await mediator.Send(new GetUACSCodeSegmentFiscalYearByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Updates an existing UACS code segment fiscal year association.
    /// </summary>
    [HttpPut("{id}")]
    [HasPermission(Permissions.Finance.uacsManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateUACSCodeSegmentFiscalYear(Guid id, [FromBody] UpdateUACSCodeSegmentFiscalYearRequest dto)
    {
        var command = new UpdateUACSCodeSegmentFiscalYearCommand
        {
            Id = id,
            UpdateUACSCodeSegmentFiscalYear = dto
        };

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Deletes a UACS code segment fiscal year association.
    /// </summary>
    [HttpDelete("{id}")]
    [HasPermission(Permissions.Finance.uacsManage)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteUACSCodeSegmentFiscalYear(Guid id)
    {
        var result = await mediator.Send(new DeleteUACSCodeSegmentFiscalYearCommand(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }
}
