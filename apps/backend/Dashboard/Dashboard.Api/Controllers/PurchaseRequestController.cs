using Microsoft.AspNetCore.Authorization;
using ERPEZ.Shared.Constants;
using ERPEZ.Shared.Authorization;
using ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.CreatePR;
using ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.DeletePR;
using ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.UpdatePR;
using ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.UpdatePRStatus;
using ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;
using ERPEZ.Application.Features.Procurement.PurchaseRequests.Queries.GetPRById;
using ERPEZ.Application.Features.Procurement.PurchaseRequests.Queries.GetPRs;
using ERPEZ.Application.Features.Procurement.PurchaseRequests.Queries.GetEligiblePPMPs;
using ERPEZ.Application.Features.Procurement.PurchaseRequests.Queries.GetPRSummaryStats;
using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using ERPEZ.Api.Attributes;

namespace ERPEZ.Api.Controllers;

[Route("purchase-requests")]
[ApiController]
[Authorize]
[RequireModule("pms")]
public class PurchaseRequestController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [HasPermission(Permissions.Procurement.prCreate)]
    public async Task<IActionResult> CreatePR(
        [FromBody] CreatePRCommand command,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(command, cancellationToken);
        return result.Succeeded
            ? CreatedAtAction(nameof(GetPRById), new { id = result.Data }, result)
            : BadRequest(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<PurchaseRequestDetailResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.prManage)]
    public async Task<IActionResult> GetPRById(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetPRByIdQuery(id), cancellationToken);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<PurchaseRequestSummaryResponse>), StatusCodes.Status200OK)]
    [HasPermission(Permissions.Procurement.prManage)]
    public async Task<IActionResult> GetPRs(
        [FromQuery] GetPRsQuery query,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("stats")]
    [ProducesResponseType(typeof(ApiResponse<PRSummaryStatsResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.prManage)]
    public async Task<IActionResult> GetPRSummaryStats(
        [FromQuery] Guid? officeId,
        [FromQuery] PRType prType,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new GetPRSummaryStatsQuery(officeId, prType), cancellationToken);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.prManage)]
    public async Task<IActionResult> UpdatePR(
        Guid id,
        [FromBody] UpdatePRRequest dto,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new UpdatePRCommand(id, dto), cancellationToken);   // ← positional
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.prManage)]
    public async Task<IActionResult> DeletePR(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new DeletePRCommand(id), cancellationToken);
        return result.Succeeded ? NoContent() : NotFound(result);
    }

    [HttpPatch("{id}/status")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.prManage)]
    public async Task<IActionResult> UpdatePRStatus(
        Guid id,
        [FromBody] UpdatePRStatusRequest dto,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new UpdatePRStatusCommand(id, dto.NewStatus), cancellationToken);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpGet("eligible-ppmps")]
    [ProducesResponseType(typeof(ApiResponse<List<EligiblePPMPResponse>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetEligiblePPMPsByOffice(
        [FromQuery] Guid officeId,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetEligiblePPMPsQuery(OfficeId: officeId), cancellationToken);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpGet("{id:guid}/eligible-ppmps")]
    [ProducesResponseType(typeof(ApiResponse<List<EligiblePPMPResponse>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.prManage)]
    public async Task<IActionResult> GetEligiblePPMPs(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetEligiblePPMPsQuery(PurchaseRequestId: id), cancellationToken);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpGet("eligible-aprs")]
    [ProducesResponseType(typeof(ApiResponse<List<EligibleAPRResponse>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetEligibleAPRsByOffice(
        [FromQuery] Guid officeId,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new ERPEZ.Application.Features.Procurement.PurchaseRequests.Queries.GetEligibleAPRs.GetEligibleAPRsQuery(OfficeId: officeId), cancellationToken);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpGet("{id:guid}/eligible-aprs")]
    [ProducesResponseType(typeof(ApiResponse<List<EligibleAPRResponse>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.prManage)]
    public async Task<IActionResult> GetEligibleAPRs(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new ERPEZ.Application.Features.Procurement.PurchaseRequests.Queries.GetEligibleAPRs.GetEligibleAPRsQuery(PurchaseRequestId: id), cancellationToken);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }
}