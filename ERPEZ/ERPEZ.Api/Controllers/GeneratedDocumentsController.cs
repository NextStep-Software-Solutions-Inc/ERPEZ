using ERPEZ.Application.Features.Planning.Document.Commands.GenerateLIB;
using ERPEZ.Application.Features.Planning.Document.Commands.GeneratePPMP;
using ERPEZ.Application.Features.Planning.Document.Commands.GenerateAPP;
using ERPEZ.Application.Interfaces.Services;   // IDocumentStorageService
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;                 // IUnitOfWork
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;                 // NotFoundException
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.API.Controllers.Planning;

[ApiController]
[Route("api/planning/documents")]
public class DocumentController(IMediator mediator,
    IUnitOfWork unitOfWork,
    IDocumentStorageService storageService
    ) : ControllerBase
{
    private static bool TryParseExportFormat(string? format, out ExportFormat exportFormat)
    {
        if (string.IsNullOrWhiteSpace(format))
        {
            exportFormat = ExportFormat.Pdf;
            return true;
        }

        if (int.TryParse(format, out _))
        {
            exportFormat = default;
            return false;
        }

        return Enum.TryParse(format, ignoreCase: true, out exportFormat);
    }

    [HttpPost("ppmp/{ppmpId}/generate")]
    public async Task<ActionResult<ApiResponse<Guid>>> GeneratePpmp(
        Guid         ppmpId,
        [FromQuery]  string? format,
        CancellationToken cancellationToken = default)
    {
        if (!TryParseExportFormat(format, out var exportFormat))
            return BadRequest("Invalid format. Use enum name values such as 'Pdf' or 'Excel'. Numeric values are not supported.");

        var command = new GeneratePpmpDocumentCommand
        {
            PpmpId      = ppmpId,
            Format      = exportFormat,
            GeneratedBy = User.Identity?.Name ?? "system"
        };

        var result = await mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    [HttpPost("lib/{libId:guid}/generate")]
    public async Task<ActionResult<ApiResponse<Guid>>> GenerateLib(
        Guid              libId,
        [FromQuery]       string? format,
        CancellationToken cancellationToken   = default)
    {
        if (!TryParseExportFormat(format, out var exportFormat))
            return BadRequest("Invalid format. Use enum name values such as 'Pdf' or 'Excel'. Numeric values are not supported.");

        var command = new GenerateLibDocumentCommand
        {
            LibId       = libId,
            Format      = exportFormat,
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