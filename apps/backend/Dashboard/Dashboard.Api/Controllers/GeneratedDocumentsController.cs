using ERPEZ.Application.Features.Planning.Document.Commands.GenerateLIB;
using ERPEZ.Application.Features.Planning.Document.Commands.GeneratePPMP;
using ERPEZ.Application.Features.Planning.Document.Commands.GenerateAPP;
using ERPEZ.Application.Features.Planning.Document.Commands.GenerateOPCRRating;
using ERPEZ.Application.Features.Planning.Document.Commands.GenerateOPCR;
using ERPEZ.Application.Features.Planning.Document.Commands.GenerateConsolidatedOPCR;
using ERPEZ.Application.Features.Planning.Document.Commands.GenerateMarketScoping;
using ERPEZ.Application.Features.Planning.Document.Commands.GenerateWFP;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.API.Controllers;

[ApiController]
[Route("api/planning/documents")]
public class DocumentController(IMediator mediator,
    IUnitOfWork unitOfWork,
    IDocumentStorageService storageService
    ) : ControllerBase
{

    [HttpPost("ppmp/{ppmpId}/generate")]
    public async Task<ActionResult<ApiResponse<Guid>>> GeneratePpmp(
        Guid         ppmpId,
        [FromQuery]  ExportFormat format = ExportFormat.Pdf,
        CancellationToken cancellationToken = default)
    {
        var command = new GeneratePpmpDocumentCommand
        {
            PpmpId      = ppmpId,
            Format      = format,
            GeneratedBy = User.Identity?.Name ?? "system"
        };

        var result = await mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    [HttpPost("lib/{libId:guid}/generate")]
    public async Task<ActionResult<ApiResponse<Guid>>> GenerateLib(
        Guid              libId,
        [FromQuery]       ExportFormat format = ExportFormat.Pdf,
        CancellationToken cancellationToken   = default)
    {
        var command = new GenerateLibDocumentCommand
        {
            LibId       = libId,
            Format      = format,
            GeneratedBy = User.Identity?.Name ?? "system"
        };

        var result = await mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    [HttpPost("lib-amendment/{amendmentRequestId:guid}/generate")]
    public async Task<ActionResult<ApiResponse<Guid>>> GenerateLibAmendment(
        Guid amendmentRequestId,
        [FromQuery] ExportFormat format = ExportFormat.Pdf,
        CancellationToken cancellationToken = default)
    {
        var command = new ERPEZ.Application.Features.Planning.Document.Commands.GenerateLIBAmendment.GenerateLIBAmendmentDocumentCommand
        {
            AmendmentRequestId = amendmentRequestId,
            Format = format,
            GeneratedBy = User.Identity?.Name ?? "system"
        };
        var result = await mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    [HttpPost("app/{appId}/generate")]
    public async Task<ActionResult<ApiResponse<Guid>>> GenerateApp(
        Guid         appId,
        [FromQuery]  ExportFormat format = ExportFormat.Pdf,
        CancellationToken cancellationToken = default)
    {
        var command = new GenerateAppDocumentCommand
        {
            AppId       = appId,
            Format      = format,
            GeneratedBy = User.Identity?.Name ?? "system"
        };

        var result = await mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    // ── WFP — Work Plan ───────────────────────────────────────────────────────

    /// <summary>
    /// Generates the Work Plan (WFP) document.
    /// Produces the quarterly % target table grouped by Objective → Activity,
    /// with Weighted % Total column. Supports both External and OPCR-mode WFPs.
    /// </summary>
    [HttpPost("wfp/{wfpId:guid}/generate")]
    public async Task<ActionResult<ApiResponse<Guid>>> GenerateWfp(
        Guid              wfpId,
        [FromQuery] ExportFormat format = ExportFormat.Pdf,
        CancellationToken cancellationToken = default)
    {
        var command = new GenerateWfpDocumentCommand
        {
            WfpId       = wfpId,
            Format      = format,
            GeneratedBy = User.Identity?.Name ?? "system"
        };

        var result = await mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    // ── OPCR — Proposed ───────────────────────────────────────────────────────

    /// <summary>
    /// Generates the Proposed OPCR PDF — performance targets only, no ratings.
    /// </summary>
    [HttpPost("opcr/{opcrId:guid}/generate")]
    public async Task<ActionResult<ApiResponse<Guid>>> GenerateProposedOpcr(
        Guid              opcrId,
        [FromQuery] ExportFormat format = ExportFormat.Pdf,
        CancellationToken cancellationToken = default)
    {
        var command = new GenerateProposedOpcrDocumentCommand
        {
            OPCRId      = opcrId,
            Format      = format,
            GeneratedBy = User.Identity?.Name ?? "system"
        };

        var result = await mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    // ── OPCR — With Ratings ───────────────────────────────────────────────────

    /// <summary>
    /// Generates the OPCR with Ratings PDF — targets + actual accomplishments +
    /// Q/E/T/Ave PMT ratings + adjectival ratings + overall summary.
    /// Pass evaluationId to scope to a specific evaluation; omit to use the most recent.
    /// </summary>
    [HttpPost("opcr/{opcrId:guid}/generate-rating")]
    public async Task<ActionResult<ApiResponse<Guid>>> GenerateOpcrRating(
        Guid              opcrId,
        [FromQuery] Guid? evaluationId     = null,
        [FromQuery] ExportFormat format    = ExportFormat.Pdf,
        CancellationToken cancellationToken = default)
    {
        var command = new GenerateOpcrRatingDocumentCommand
        {
            OPCRId       = opcrId,
            EvaluationId = evaluationId,
            Format       = format,
            GeneratedBy  = User.Identity?.Name ?? "system"
        };

        var result = await mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    [HttpPost("opcr/consolidations/{consolidationId:guid}/generate")]
    public async Task<ActionResult<ApiResponse<Guid>>> GenerateConsolidatedOpcr(
        Guid              consolidationId,
        [FromQuery] ExportFormat format       = ExportFormat.Pdf,
        [FromQuery] string       ratingPeriod = "",
        CancellationToken        cancellationToken = default)
    {
        var result = await mediator.Send(new GenerateConsolidatedOpcrDocumentCommand
        {
            ConsolidationId = consolidationId,
            Format          = format,
            RatingPeriod    = ratingPeriod,
            GeneratedBy     = User.Identity?.Name ?? "system"
        }, cancellationToken);

        return Ok(result);
    }

    [HttpPost("market-scoping/{marketScopingId:guid}/generate")]
    public async Task<ActionResult<ApiResponse<Guid>>> GenerateMarketScoping(
        Guid marketScopingId,
        [FromQuery] ExportFormat format = ExportFormat.Pdf,
        CancellationToken cancellationToken = default)
    {
        var command = new GenerateMarketScopingDocumentCommand
        {
            MarketScopingId = marketScopingId,
            Format = format,
            GeneratedBy = User.Identity?.Name ?? "system"
        };
        var result = await mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    [HttpPost("bac-resolution/{bacResolutionId:guid}/generate")]
    public async Task<ActionResult<ApiResponse<Guid>>> GenerateBacResolution(
        Guid bacResolutionId,
        [FromQuery] ExportFormat format = ExportFormat.Pdf,
        CancellationToken cancellationToken = default)
    {
        var command = new ERPEZ.Application.Features.Procurement.Projects.Commands.GenerateBacResolutionDocument.GenerateBacResolutionDocumentCommand
        {
            BacResolutionId = bacResolutionId,
            Format = format,
            GeneratedBy = User.Identity?.Name ?? "system"
        };
        var result = await mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{documentId:guid}/download")]
    public async Task<IActionResult> Download(
        Guid documentId,
        CancellationToken cancellationToken = default)
    {
        var document = await unitOfWork.GeneratedDocumentRepository
            .FindAsync(d => d.Id == documentId, cancellationToken)
            ?? throw new NotFoundException("Generated document not found.");

        var bytes = await storageService.GetAsync(document.StoragePath, cancellationToken);

        var contentType = document.Format == ExportFormat.Excel
            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : "application/pdf";

        return File(bytes, contentType, document.FileName);
    }
}
