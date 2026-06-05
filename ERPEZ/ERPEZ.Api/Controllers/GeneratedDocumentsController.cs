using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("planning/generated-documents")]
[ApiController]
[Authorize]
public class GeneratedDocumentsController(
    IUnitOfWork             unitOfWork,
    IDocumentStorageService storageService) : ControllerBase
{
    [HttpGet("agency/{agencyId:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByAgency(Guid agencyId, CancellationToken cancellationToken)
    {
        var docs = await unitOfWork.GeneratedDocumentRepository
            .GetByAgencyAsync(agencyId, cancellationToken);

        var response = docs.Select(d => new
        {
            d.Id,
            DocumentType  = d.DocumentType.ToString(),
            Format        = d.Format.ToString(),
            d.FileName,
            d.FiscalYear,
            d.GeneratedBy,
            d.CreatedAt,
            d.FileSizeBytes
        });

        return Ok(ApiResponse<object>.Success(response, "Documents retrieved successfully."));
    }

    [HttpGet("{id:guid}/download")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Download(Guid id, CancellationToken cancellationToken)
    {
        var record = await unitOfWork.GeneratedDocumentRepository
            .FindAsync(d => d.Id == id, cancellationToken);

        if (record is null)
            return NotFound(ApiResponse<object>.Failure("Document not found."));

        var bytes       = await storageService.GetAsync(record.StoragePath, cancellationToken);
        var contentType = record.Format == ExportFormat.Pdf
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

        return File(bytes, contentType, record.FileName);
    }
}