using ERPEZ.Application.Features.Planning.FiscalMonth.Commands.LockFiscalMonth;
using ERPEZ.Application.Features.Planning.FiscalMonth.Commands.UnlockFiscalMonth;
using ERPEZ.Application.Features.Planning.FiscalMonth.Dtos;
using ERPEZ.Application.Features.Planning.FiscalMonth.Queries.GetFiscalMonthById;
using ERPEZ.Application.Features.Planning.FiscalMonth.Queries.GetFiscalMonths;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("fiscal-months")]
[ApiController]
[Authorize]
public class FiscalMonthController(ISender mediator) : ControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.Planning.fiscalYearView)]
    [ProducesResponseType(typeof(PaginatedApiResponse<FiscalMonthResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetFiscalMonths([FromQuery] GetFiscalMonthsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [HasPermission(Permissions.Planning.fiscalYearView)]
    [ProducesResponseType(typeof(ApiResponse<FiscalMonthDetailedResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetFiscalMonthById(Guid id)
    {
        var fiscalMonth = await mediator.Send(new GetFiscalMonthByIdQuery(id));

        return fiscalMonth.Succeeded ? Ok(fiscalMonth) : NotFound(fiscalMonth);
    }

    [HttpPost("{id}/lock")]
    [HasPermission(Permissions.Finance.fiscalMonthLockUnlock)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> LockFiscalMonth(Guid id)
    {
        var command = new LockFiscalMonthCommand(id);
        var response = await mediator.Send(command);

        return response.Succeeded ? Ok(response) : NotFound(response);
    }

    [HttpPost("{id}/unlock")]
    [HasPermission(Permissions.Finance.fiscalMonthLockUnlock)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UnlockFiscalMonth(Guid id)
    {
        var command = new UnlockFiscalMonthCommand(id);
        var response = await mediator.Send(command);

        return response.Succeeded ? Ok(response) : NotFound(response);
    }
}
