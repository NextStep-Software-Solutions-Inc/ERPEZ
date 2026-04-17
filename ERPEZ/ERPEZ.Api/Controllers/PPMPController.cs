using ERPEZ.Application.Features.Planning.PPMP.Commands.ApprovePPMP;
using ERPEZ.Application.Features.Planning.PPMP.Commands.ConsolidatePPMPs;
using ERPEZ.Application.Features.Planning.PPMP.Commands.CreatePPMP;
using ERPEZ.Application.Features.Planning.PPMP.Commands.DeletePPMP;
using ERPEZ.Application.Features.Planning.PPMP.Commands.RejectPPMP;
using ERPEZ.Application.Features.Planning.PPMP.Commands.SubmitPPMPForApproval;
using ERPEZ.Application.Features.Planning.PPMP.Commands.UpdatePPMP;
using ERPEZ.Application.Features.Planning.PPMP.Dtos;
using ERPEZ.Application.Features.Planning.PPMP.Queries.GetPPMPApprovalHistory;
using ERPEZ.Application.Features.Planning.PPMP.Queries.GetPPMPById;
using ERPEZ.Application.Features.Planning.PPMP.Queries.GetPPMPs;
using ERPEZ.Application.Features.Planning.PPMP.Queries.GetPPMPsByFiscalYear;
using ERPEZ.Application.Features.Planning.PPMP.Queries.GetPPMPsByOffice;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("ppmps")]
[ApiController]
public class PPMPController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreatePPMP([FromBody] CreatePPMPCommand command)
    {
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetPPMPById), new { id = result.Data }, result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<PPMPResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPPMPs([FromQuery] GetPPMPsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<PPMPDetailedResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPPMPById(Guid id)
    {
        var result = await mediator.Send(new GetPPMPByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpGet("by-office/{officeId}")]
    [ProducesResponseType(typeof(PaginatedApiResponse<PPMPResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPPMPsByOffice(Guid officeId, [FromQuery] GetPPMPsByOfficeQuery query)
    {
        var result = await mediator.Send(query with { OfficeId = officeId });
        return Ok(result);
    }

    [HttpGet("by-fiscal-year/{fiscalYearId}")]
    [ProducesResponseType(typeof(PaginatedApiResponse<PPMPResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPPMPsByFiscalYear(Guid fiscalYearId, [FromQuery] GetPPMPsByFiscalYearQuery query)
    {
        var result = await mediator.Send(query with { FiscalYearId = fiscalYearId });
        return Ok(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdatePPMP(Guid id, [FromBody] UpdatePPMPRequest dto)
    {
        var command = new UpdatePPMPCommand(id, dto);
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeletePPMP(Guid id)
    {
        var command = new DeletePPMPCommand(id);
        var result = await mediator.Send(command);

        return result.Succeeded ? NoContent() : NotFound();
    }

    [HttpPost("{id}/submit")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SubmitPPMPForApproval(Guid id, [FromBody] SubmitPPMPForApprovalCommand command)
    {
        var result = await mediator.Send(command with { Id = id });
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPost("{id}/approve")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ApprovePPMP(Guid id, [FromBody] ApprovePPMPCommand command)
    {
        var result = await mediator.Send(command with { Id = id });
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPost("{id}/reject")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RejectPPMP(Guid id, [FromBody] RejectPPMPCommand command)
    {
        var result = await mediator.Send(command with { Id = id });
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPost("consolidate")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ConsolidatePPMPs([FromBody] ConsolidatePPMPsCommand command)
    {
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpGet("{id}/approval-history")]
    [ProducesResponseType(typeof(ApiResponse<List<ApprovalEventResponse>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPPMPApprovalHistory(Guid id)
    {
        var result = await mediator.Send(new GetPPMPApprovalHistoryQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }
}
