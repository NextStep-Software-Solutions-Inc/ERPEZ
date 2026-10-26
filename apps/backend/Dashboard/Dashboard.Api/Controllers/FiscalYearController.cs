using ERPEZ.Application.Features.Planning.FiscalYear.Commands.CreateFiscalYear;
using ERPEZ.Application.Features.Planning.FiscalYear.Commands.DeleteFiscalYear;
using ERPEZ.Application.Features.Planning.FiscalYear.Commands.RolloverFiscalYear;
using ERPEZ.Application.Features.Planning.FiscalYear.Commands.UpdateFiscalYear;
using ERPEZ.Application.Features.Planning.FiscalYear.Commands.UpdateFiscalYearLock;
using ERPEZ.Application.Features.Planning.FiscalYear.Commands.UpdateFiscalYearStatus;
using ERPEZ.Application.Features.Planning.FiscalYear.Dtos;
using ERPEZ.Application.Features.Planning.FiscalYear.Queries.GetFiscalYearById;
using ERPEZ.Application.Features.Planning.FiscalYear.Queries.GetFiscalYears;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using ERPEZ.Api.Attributes;

namespace ERPEZ.Api.Controllers;

[Route("fiscal-years")]
[ApiController]
[Authorize]
[RequireModule("pbms")]
public class FiscalYearController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [HasPermission(Permissions.Planning.fiscalYearManage)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateFiscalYear([FromBody] CreateFiscalYearCommand command)
    {
        var result = await mediator.Send(command);
        return !result.Succeeded ? BadRequest(result) : CreatedAtAction(nameof(GetFiscalYearById), new { id = result.Data }, result);
    }

    [HttpGet]
    [HasPermission(Permissions.Planning.fiscalYearView)]
    [ProducesResponseType(typeof(PaginatedApiResponse<FiscalYearResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetFiscalYears([FromQuery] GetFiscalYearsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [HasPermission(Permissions.Planning.fiscalYearView)]
    [ProducesResponseType(typeof(ApiResponse<FiscalYearResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetFiscalYearById(Guid id)
    {
        var result = await mediator.Send(new GetFiscalYearByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [HasPermission(Permissions.Planning.fiscalYearManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateFiscalYear(Guid id, [FromBody] UpdateFiscalYearRequest dto)
    {
        var command = new UpdateFiscalYearCommand
        {
            Id = id,
            Year = dto.Year,
            Description = dto.Description,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate
        };

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [HasPermission(Permissions.Planning.fiscalYearManage)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteFiscalYear(Guid id)
    {
        var result = await mediator.Send(new DeleteFiscalYearCommand(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPatch("{id}/status")]
    [HasPermission(Permissions.Planning.fiscalYearManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateFiscalYearStatus(Guid id, [FromBody] UpdateStatusRequest request)
    {
        var command = new UpdateFiscalYearStatusCommand(id, request.Status);
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPatch("{id}/lock")]
    [HasPermission(Permissions.Planning.fiscalYearManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> LockFiscalYear(Guid id)
    {
        var command = new UpdateFiscalYearLockCommand(id, true);
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPatch("{id}/unlock")]
    [HasPermission(Permissions.Planning.fiscalYearManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UnlockFiscalYear(Guid id)
    {
        var command = new UpdateFiscalYearLockCommand(id, false);
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPost("{id}/rollover")]
    [HasPermission(Permissions.Planning.dataMigrationsManage)]
    [ProducesResponseType(typeof(ApiResponse<RolloverResultResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<RolloverResultResponse>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> RolloverFiscalYear(Guid id, [FromBody] RolloverFiscalYearRequest request)
    {
        var command = new RolloverFiscalYearCommand
        {
            TargetFiscalYearId = id,
            SourceFiscalYearId = request.SourceFiscalYearId,
            IncludeOrgStructure = request.IncludeOrgStructure,
            IncludeUACSLibrary = request.IncludeUACSLibrary,
            IncludeRecurringExpenses = request.IncludeRecurringExpenses
        };

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }
}
