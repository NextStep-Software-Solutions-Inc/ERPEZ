using Microsoft.AspNetCore.Authorization;
using ERPEZ.Shared.Constants;
using ERPEZ.Shared.Authorization;
using ERPEZ.Application.Features.Planning.PPMP.Commands.ConsolidatePPMPs;
using ERPEZ.Application.Features.Planning.PPMP.Commands.CreatePPMP;
using ERPEZ.Application.Features.Planning.PPMP.Commands.CreateSupplementalPPMP;
using ERPEZ.Application.Features.Planning.PPMP.Commands.DeletePPMP;
using ERPEZ.Application.Features.Planning.PPMP.Commands.ApprovePPMP;
using ERPEZ.Application.Features.Planning.PPMP.Commands.ReturnPPMP;
using ERPEZ.Application.Features.Planning.PPMP.Commands.TogglePPMPFinalization;
using ERPEZ.Application.Features.Planning.PPMP.Commands.UpdatePPMPStatus;
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
using Unit = MediatR.Unit;

namespace ERPEZ.Api.Controllers;

[Route("ppmps")]
[ApiController]
[Authorize]
public class PPMPController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [HasPermission(Permissions.Procurement.ppmpCreate)]
    public async Task<IActionResult> CreatePPMP([FromBody] CreatePPMPCommand command)
    {
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetPPMPById), new { id = result.Data }, result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<PPMPDetailedResponse>), StatusCodes.Status200OK)]
    [HasPermission(Permissions.Procurement.ppmpView)]
    public async Task<IActionResult> GetPPMPs([FromQuery] GetPPMPsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<PPMPDetailedResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.ppmpView)]
    public async Task<IActionResult> GetPPMPById(Guid id)
    {
        var result = await mediator.Send(new GetPPMPByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpGet("by-office/{officeId}")]
    [ProducesResponseType(typeof(ApiResponse<List<PPMPDetailedResponse>>), StatusCodes.Status200OK)]
    [HasPermission(Permissions.Procurement.ppmpView)]
    public async Task<IActionResult> GetPPMPsByOffice(Guid officeId, [FromQuery] GetPPMPsByOfficeQuery query)
    {
        var result = await mediator.Send(query with { OfficeId = officeId });
        return Ok(result);
    }

    [HttpGet("by-fiscal-year/{fiscalYearId}")]
    [ProducesResponseType(typeof(ApiResponse<List<PPMPDetailedResponse>>), StatusCodes.Status200OK)]
    [HasPermission(Permissions.Procurement.ppmpView)]
    public async Task<IActionResult> GetPPMPsByFiscalYear(Guid fiscalYearId, [FromQuery] GetPPMPsByFiscalYearQuery query)
    {
        var result = await mediator.Send(query with { FiscalYearId = fiscalYearId });
        return Ok(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.ppmpUpdate)]
    public async Task<IActionResult> UpdatePPMP(Guid id, [FromBody] UpdatePPMPRequest dto)
    {
        var command = new UpdatePPMPCommand(id, dto);
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.ppmpUpdate)]
    public async Task<IActionResult> DeletePPMP(Guid id)
    {
        var command = new DeletePPMPCommand(id);
        var result = await mediator.Send(command);

        return result.Succeeded ? NoContent() : NotFound();
    }

    [HttpPut("status")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.ppmpSubmit)]
    public async Task<IActionResult> UpdatePPMPStatus([FromBody] UpdatePPMPStatusCommand command)
    {
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPost("{id}/approve")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.ppmpApprove)]
    public async Task<IActionResult> ApprovePPMP(Guid id, [FromBody] ApprovePPMPRequest? request)
    {
        var result = await mediator.Send(new ApprovePPMPCommand(id, request));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPost("{id}/return")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.ppmpApprove)]
    public async Task<IActionResult> ReturnPPMP(Guid id, [FromBody] ReturnPPMPRequest request)
    {
        var result = await mediator.Send(new ReturnPPMPCommand(id, request));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPost("consolidate")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [HasPermission(Permissions.Procurement.ppmpConsolidate)]
    public async Task<IActionResult> ConsolidatePPMPs([FromBody] ConsolidatePPMPsCommand command)
    {
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpGet("{id}/approval-history")]
    [ProducesResponseType(typeof(ApiResponse<List<ApprovalEventResponse>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.ppmpReview)]
    public async Task<IActionResult> GetPPMPApprovalHistory(Guid id)
    {
        var result = await mediator.Send(new GetPPMPApprovalHistoryQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPost("approval-history")]
    [ProducesResponseType(typeof(ApiResponse<List<ApprovalEventResponse>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.ppmpReview)]
    public async Task<IActionResult> GetPPMPApprovalHistoryByBody([FromBody] GetPPMPApprovalHistoryRequest request)
    {
        var result = await mediator.Send(new GetPPMPApprovalHistoryQuery(request.PPMPId));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPost("{id}/supplemental")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.ppmpCreate)]
    public async Task<IActionResult> CreateSupplementalPPMP(Guid id, [FromBody] CreateSupplementalPPMPRequest? dto)
    {
        var result = await mediator.Send(new CreateSupplementalPPMPCommand(id, dto));
        return result.Succeeded
            ? CreatedAtAction(nameof(GetPPMPById), new { id = result.Data }, result)
            : BadRequest(result);
    }

    [HttpPost("{id}/toggle-final")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.ppmpSubmit)]
    public async Task<IActionResult> ToggleFinal(Guid id, [FromBody] TogglePPMPFinalizationRequest request)
    {
        var result = await mediator.Send(new TogglePPMPFinalizationCommand(id, request.IsFinal));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }
}
