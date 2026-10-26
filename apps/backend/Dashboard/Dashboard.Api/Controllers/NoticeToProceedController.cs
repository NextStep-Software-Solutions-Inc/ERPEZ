using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.NoticeToProceeds.Commands.CancelNoticeToProceed;
using ERPEZ.Application.Features.Procurement.NoticeToProceeds.Commands.CreateNoticeToProceed;
using ERPEZ.Application.Features.Procurement.NoticeToProceeds.Commands.DeleteNoticeToProceed;
using ERPEZ.Application.Features.Procurement.NoticeToProceeds.Commands.GenerateNoticeToProceedDocument;
using ERPEZ.Application.Features.Procurement.NoticeToProceeds.Commands.IssueNoticeToProceed;
using ERPEZ.Application.Features.Procurement.NoticeToProceeds.Commands.RecordNoticeToProceedReceipt;
using ERPEZ.Application.Features.Procurement.NoticeToProceeds.Commands.UpdateNoticeToProceed;
using ERPEZ.Application.Features.Procurement.NoticeToProceeds.Dtos;
using ERPEZ.Application.Features.Procurement.NoticeToProceeds.Queries.GetAvailableContractsForNoticeToProceed;
using ERPEZ.Application.Features.Procurement.NoticeToProceeds.Queries.GetNoticeToProceedByContractId;
using ERPEZ.Application.Features.Procurement.NoticeToProceeds.Queries.GetNoticeToProceedById;
using ERPEZ.Application.Features.Procurement.NoticeToProceeds.Queries.GetNoticeToProceedPdf;
using ERPEZ.Application.Features.Procurement.NoticeToProceeds.Queries.GetNoticeToProceeds;
using ERPEZ.Application.Features.Procurement.NoticeToProceeds.Queries.GetNoticeToProceedSummary;
using ERPEZ.Application.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

/// <summary>
/// Manages Notice to Proceed (NTP) lifecycle, drafting, issuance, contractor receipt (conforme),
/// cancellations, QuestPDF document generation, and queries under RA 12009 Section 66.
/// </summary>
[Route("notice-to-proceed")]
[ApiController]
[Authorize]
public class NoticeToProceedController(ISender mediator, ICurrentUserService? currentUserService = null) : ControllerBase
{
    private string GetCurrentActorName()
    {
        return !string.IsNullOrWhiteSpace(currentUserService?.Name)
            ? currentUserService.Name
            : (!string.IsNullOrWhiteSpace(currentUserService?.Username) ? currentUserService.Username : "Procurement User");
    }

    /// <summary>
    /// Get paginated list of Notice to Proceed records with Sieve filtering, sorting, and status filter.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<NoticeToProceedListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetNoticeToProceeds([FromQuery] GetNoticeToProceedsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get aggregate statistics and summary metrics for the Notice to Proceed workspace.
    /// </summary>
    [HttpGet("summary")]
    [ProducesResponseType(typeof(ApiResponse<NoticeToProceedSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSummary()
    {
        var result = await mediator.Send(new GetNoticeToProceedSummaryQuery());
        return Ok(result);
    }

    /// <summary>
    /// Get approved/executed contracts eligible for new NTP creation (no active NTP linked).
    /// </summary>
    [HttpGet("available-contracts")]
    [ProducesResponseType(typeof(ApiResponse<List<AvailableContractForNoticeToProceedDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAvailableContracts()
    {
        var result = await mediator.Send(new GetAvailableContractsForNoticeToProceedQuery());
        return Ok(result);
    }

    /// <summary>
    /// Get single Notice to Proceed detail by ID including linked Contract, projected items, and audit metadata.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<NoticeToProceedDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await mediator.Send(new GetNoticeToProceedByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Get the active Notice to Proceed linked to a specific Contract ID.
    /// </summary>
    [HttpGet("contract/{contractId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<NoticeToProceedDetailDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByContractId(Guid contractId)
    {
        var result = await mediator.Send(new GetNoticeToProceedByContractIdQuery(contractId));
        return Ok(result);
    }

    /// <summary>
    /// Create a new Notice to Proceed in Draft status linked to an approved/executed Contract.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateNoticeToProceedCommand command)
    {
        var result = await mediator.Send(command);
        return result.Succeeded
            ? CreatedAtAction(nameof(GetById), new { id = result.Data }, result)
            : BadRequest(result);
    }

    /// <summary>
    /// Update header details of a Draft Notice to Proceed.
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateNoticeToProceedCommand command)
    {
        var result = await mediator.Send(command with { Id = id });
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Issue an official Notice to Proceed to the contractor/supplier (RA 12009 Sec. 66).
    /// Freezes audit snapshots (Supplier, Project, Contract Price) for historical immutability.
    /// </summary>
    [HttpPost("{id:guid}/issue")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Issue(Guid id, [FromBody] IssueNoticeToProceedCommand? command = null)
    {
        var cmd = (command ?? new IssueNoticeToProceedCommand()) with { Id = id };
        var result = await mediator.Send(cmd);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Record contractor/supplier acknowledgment and receipt date (conforme) per GPPB standard form.
    /// </summary>
    [HttpPost("{id:guid}/record-receipt")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RecordReceipt(Guid id, [FromBody] RecordNoticeToProceedReceiptCommand command)
    {
        var result = await mediator.Send(command with { Id = id });
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Cancel an active Notice to Proceed with justification reason.
    /// </summary>
    [HttpPost("{id:guid}/cancel")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Cancel(Guid id, [FromBody] CancelNoticeToProceedCommand command)
    {
        var result = await mediator.Send(command with { Id = id });
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Delete a Notice to Proceed in Draft status.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await mediator.Send(new DeleteNoticeToProceedCommand(id));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Generate and persist official Notice to Proceed PDF document in GeneratedDocuments storage.
    /// </summary>
    [HttpPost("{id:guid}/generate-document")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GenerateDocument(Guid id)
    {
        var actorName = GetCurrentActorName();
        var command = new GenerateNoticeToProceedDocumentCommand
        {
            NoticeToProceedId = id,
            GeneratedBy = actorName
        };
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Stream official server-rendered Notice to Proceed PDF directly (inline preview / download).
    /// </summary>
    [HttpGet("{id:guid}/pdf")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPdf(Guid id)
    {
        var query = new GetNoticeToProceedPdfQuery(id);
        var result = await mediator.Send(query);
        if (!result.Succeeded || result.Data == null)
        {
            return NotFound(result);
        }

        Response.Headers["Content-Disposition"] = $"inline; filename=\"{result.Data.FileName}\"";
        return File(result.Data.FileBytes, result.Data.ContentType, result.Data.FileName);
    }
}
