using Microsoft.AspNetCore.Authorization;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Constants;
using ERPEZ.Application.Features.Planning.Document.Commands.GenerateLIB;
using ERPEZ.Application.Features.Planning.Document.Commands.GeneratePPMP;
using ERPEZ.Application.Features.Planning.Document.Commands.GenerateAPP;
using ERPEZ.Application.Features.Planning.Document.Commands.GenerateOPCRRating;
using ERPEZ.Application.Features.Planning.Document.Commands.GenerateOPCR;
using ERPEZ.Application.Features.Planning.Document.Commands.GenerateConsolidatedOPCR;
using ERPEZ.Application.Features.Planning.Document.Commands.GenerateMarketScoping;
using ERPEZ.Application.Features.Planning.Document.Commands.GenerateWFP;
using ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.GenerateRFQDocument;
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
[Authorize]
public class DocumentController(IMediator mediator,
    IUnitOfWork unitOfWork,
    IDocumentStorageService storageService
    ) : ControllerBase
{
    [HttpPost("ppmp/{ppmpId}/generate")]
    [HasPermission(Permissions.Procurement.ppmpView)]
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
    [HasPermission(Permissions.Planning.libView)]
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
    [HasPermission(Permissions.Planning.libView)]
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
    [HasPermission(Permissions.Procurement.appManage)]
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
    [HasPermission(Permissions.Planning.wfpView)]
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
    [HasPermission(Permissions.Planning.opcrView)]
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
    [HasPermission(Permissions.Planning.opcrView)]
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
    [HasPermission(Permissions.Planning.opcrView)]
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
    [HasPermission(Permissions.Planning.marketScopingView)]
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
    [HasPermission(Permissions.Procurement.bacManage)]
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

    [HttpPost("purchase-request/{purchaseRequestId:guid}/generate")]
    public async Task<ActionResult<ApiResponse<Guid>>> GeneratePurchaseRequest(
        Guid purchaseRequestId,
        [FromQuery] ExportFormat format = ExportFormat.Pdf,
        CancellationToken cancellationToken = default)
    {
        var command = new ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.GeneratePurchaseRequestDocument.GeneratePurchaseRequestDocumentCommand
        {
            PurchaseRequestId = purchaseRequestId,
            Format = format,
            GeneratedBy = User.Identity?.Name ?? "system"
        };
        var result = await mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    [HttpPost("agency-procurement-request/{aprId:guid}/generate")]
    [HttpPost("apr/{aprId:guid}/generate")]
    public async Task<ActionResult<ApiResponse<Guid>>> GenerateApr(
        Guid aprId,
        [FromQuery] ExportFormat format = ExportFormat.Pdf,
        CancellationToken cancellationToken = default)
    {
        var command = new ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Commands.GenerateAprDocument.GenerateAprDocumentCommand
        {
            APRId = aprId,
            Format = format,
            GeneratedBy = User.Identity?.Name ?? "system"
        };
        var result = await mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    [HttpPost("notice-of-award/{noaId:guid}/generate")]
    public async Task<ActionResult<ApiResponse<Guid>>> GenerateNoticeOfAward(
        Guid noaId,
        [FromQuery] ExportFormat format = ExportFormat.Pdf,
        CancellationToken cancellationToken = default)
    {
        var command = new ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.GenerateNoticeOfAwardDocument.GenerateNoticeOfAwardDocumentCommand
        {
            NoticeOfAwardId = noaId,
            Format = format,
            GeneratedBy = User.Identity?.Name ?? "system"
        };
        var result = await mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    [HttpPost("notice-to-proceed/{ntpId:guid}/generate")]
    public async Task<ActionResult<ApiResponse<Guid>>> GenerateNoticeToProceed(
        Guid ntpId,
        [FromQuery] ExportFormat format = ExportFormat.Pdf,
        CancellationToken cancellationToken = default)
    {
        var command = new ERPEZ.Application.Features.Procurement.NoticeToProceeds.Commands.GenerateNoticeToProceedDocument.GenerateNoticeToProceedDocumentCommand
        {
            NoticeToProceedId = ntpId,
            Format = format,
            GeneratedBy = User.Identity?.Name ?? "system"
        };
        var result = await mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    [HttpPost("rfq/{rfqId:guid}/generate")]
    [HasPermission(Permissions.Procurement.rfqManage)]
    public async Task<ActionResult<ApiResponse<Guid>>> GenerateRfq(
        Guid rfqId,
        [FromQuery] ExportFormat format = ExportFormat.Pdf,
        CancellationToken cancellationToken = default)
    {
        var command = new GenerateRFQDocumentCommand
        {
            RFQId = rfqId,
            Format = format,
            GeneratedBy = User.Identity?.Name ?? "system"
        };
        var result = await mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    [HttpPost("aob/{aobId:guid}/generate")]
    [HasPermission(Permissions.Procurement.aobManage)]
    public async Task<ActionResult<ApiResponse<Guid>>> GenerateAob(
        Guid aobId,
        [FromQuery] ExportFormat format = ExportFormat.Pdf,
        CancellationToken cancellationToken = default)
    {
        var command = new ERPEZ.Application.Features.Procurement.AOBs.Commands.GenerateAOBDocument.GenerateAOBDocumentCommand
        {
            AOBId = aobId,
            Format = format,
            GeneratedBy = User.Identity?.Name ?? "system"
        };
        var result = await mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    [HttpPost("direct-contracting/{id:guid}/generate")]
    [HasPermission(Permissions.Procurement.bacManage)]
    public async Task<ActionResult<ApiResponse<Guid>>> GenerateDirectContracting(
        Guid id,
        [FromQuery] ExportFormat format = ExportFormat.Pdf,
        CancellationToken cancellationToken = default)
    {
        var command = new ERPEZ.Application.Features.Procurement.DirectContractings.Commands.GenerateDirectContractingDocument.GenerateDirectContractingDocumentCommand
        {
            DirectContractingId = id,
            Format = format,
            GeneratedBy = User.Identity?.Name ?? "system"
        };
        var result = await mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{documentId:guid}/download")]
    [Authorize]
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
