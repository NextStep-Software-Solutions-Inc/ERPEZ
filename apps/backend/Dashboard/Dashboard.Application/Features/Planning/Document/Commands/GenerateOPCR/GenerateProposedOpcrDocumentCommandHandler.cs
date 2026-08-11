// GenerateProposedOpcrDocumentCommandHandler.cs
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Application.Features.Planning.Document.Commands.GenerateOPCRRating;
using ERPEZ.Application.Features.Planning.Document.Mappers;
using OPCREntity = ERPEZ.Domain.Entities.Planning.OPCR;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Document.Commands.GenerateOPCR;

public class GenerateProposedOpcrDocumentCommandHandler(
    IUnitOfWork              unitOfWork,
    IDocumentRendererService rendererService,
    IDocumentStorageService  storageService)
    : IRequestHandler<GenerateProposedOpcrDocumentCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(
        GenerateProposedOpcrDocumentCommand request,
        CancellationToken                   cancellationToken)
    {
        // ── 1. Fetch ─────────────────────────────────────────────────────────
        var opcr = await unitOfWork.OPCRRepository
            .GetOPCRWithDetailsAsync(request.OPCRId, cancellationToken)
            ?? throw new NotFoundException("OPCR not found.");

        // ── 2. Map ───────────────────────────────────────────────────────────
        var dataDto = OpcrMapper.MapToBaseDto(opcr, includeRatings: false);

        // ── 3. Render ────────────────────────────────────────────────────────
        var bytes = await rendererService.RenderAsync(
            dataDto, DocumentType.Opcr, request.Format, cancellationToken);

        // ── 4. Persist ───────────────────────────────────────────────────────
        var fileName = BuildFileName("OPCR_PROPOSED", opcr, request.Format);
        var path     = await storageService.SaveAsync(bytes, fileName, cancellationToken);

        var record = new GeneratedDocument
        {
            DocumentType  = DocumentType.Opcr,
            Format        = request.Format,
            OfficeId      = opcr.OfficeId,
            StoragePath   = path,
            FileName      = fileName,
            FileSizeBytes = bytes.Length,
            FiscalYear    = opcr.FiscalYear?.Year.ToString() ?? string.Empty,
            GeneratedBy   = request.GeneratedBy
        };

        await unitOfWork.GeneratedDocumentRepository.AddAsync(record, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(record.Id, "Proposed OPCR document generated successfully.");
    }

    private static string BuildFileName(string prefix, OPCREntity opcr, ExportFormat format)
    {
        var ext = format == ExportFormat.Excel ? "xlsx" : "pdf";
        return $"{prefix}_{opcr.Code}_{DateTime.UtcNow:yyyyMMddHHmmss}.{ext}";
    }
}