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