using ERPEZ.Application.Features.Planning.FiscalMonth.Commands.LockFiscalMonth;
using ERPEZ.Application.Features.Planning.FiscalMonth.Commands.UnlockFiscalMonth;
using ERPEZ.Application.Features.Planning.FiscalMonth.Dtos;
using ERPEZ.Application.Features.Planning.FiscalMonth.Queries.GetFiscalMonthById;
using ERPEZ.Application.Features.Planning.FiscalMonth.Queries.GetFiscalMonths;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("fiscal-months")]
[ApiController]
public class FiscalMonthController(ISender mediator) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<FiscalMonthResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFiscalMonths([FromQuery] GetFiscalMonthsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<FiscalMonthDetailedResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetFiscalMonthById(Guid id)
    {
        var fiscalMonth = await mediator.Send(new GetFiscalMonthByIdQuery(id));

        return fiscalMonth.Succeeded ? Ok(fiscalMonth) : BadRequest(fiscalMonth);
    }

    [HttpPost("{id}/lock")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> LockFiscalMonth(Guid id)
    {
        var command = new LockFiscalMonthCommand(id);
        var response = await mediator.Send(command);

        return response.Succeeded ? Ok(response) : NotFound(response);
    }

    [HttpPost("{id}/unlock")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UnlockFiscalMonth(Guid id)
    {
        var command = new UnlockFiscalMonthCommand(id);
        var response = await mediator.Send(command);

        return response.Succeeded ? Ok(response) : NotFound(response);
    }
}
