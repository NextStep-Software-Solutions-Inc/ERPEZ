using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using ERPEZ.Application.Features.Planning.FiscalYear.Commands.CreateFiscalYear;
using ERPEZ.Application.Features.Planning.FiscalYear.Commands.UpdateFiscalYear;
using ERPEZ.Application.Features.Planning.FiscalYear.Commands.DeleteFiscalYear;
using ERPEZ.Application.Features.Planning.FiscalYear.Commands.LockFiscalYear;
using ERPEZ.Application.Features.Planning.FiscalYear.Commands.UnlockFiscalYear;
using ERPEZ.Application.Features.Planning.FiscalYear.Queries.GetFiscalYears;
using ERPEZ.Application.Features.Planning.FiscalYear.Queries.GetFiscalYearById;
using ERPEZ.Application.Features.Planning.FiscalYear.Dtos;

namespace ERPEZ.Api.Controllers;

[Route("fiscal-years")]
[ApiController]
public class FiscalYearController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateFiscalYear([FromBody] CreateFiscalYearCommand command)
    {
        var result = await mediator.Send(command);
        return !result.Succeeded ? BadRequest(result) : CreatedAtAction(nameof(GetFiscalYearById), new { id = result.Data }, result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<FiscalYearResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFiscalYears([FromQuery] GetFiscalYearsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<FiscalYearResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetFiscalYearById(Guid id)
    {
        var result = await mediator.Send(new GetFiscalYearByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateFiscalYear(Guid id, [FromBody] UpdateFiscalYearRequest dto)
    {
        var command = new UpdateFiscalYearCommand
        {
            Id = id,
            Description = dto.Description,
            FunctionAllocations = dto.FunctionAllocations
        };

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteFiscalYear(Guid id)
    {
        var result = await mediator.Send(new DeleteFiscalYearCommand(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPost("{id}/lock")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> LockFiscalYear(Guid id)
    {
        var result = await mediator.Send(new LockFiscalYearCommand(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPost("{id}/unlock")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UnlockFiscalYear(Guid id)
    {
        var result = await mediator.Send(new UnlockFiscalYearCommand(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }
}
