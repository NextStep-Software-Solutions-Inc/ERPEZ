using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Application.Features.Planning.Document.Commands.GeneratePPMP;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMP.Commands.GeneratePpmpDocument;

public class GeneratePpmpDocumentCommandHandler(
    IUnitOfWork             unitOfWork,
    IDocumentRendererService rendererService,
    IDocumentStorageService  storageService)
    : IRequestHandler<GeneratePpmpDocumentCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(
        GeneratePpmpDocumentCommand request,
        CancellationToken           cancellationToken)
    {
        var bytes = await rendererService.RenderAsync(
            request, DocumentType.Ppmp, request.Format, cancellationToken);

        var extension   = request.Format == ExportFormat.Excel ? "xlsx" : "pdf";
        var fileName    = $"PPMP_{request.FiscalYear}_{DateTime.UtcNow:yyyyMMddHHmmss}.{extension}";
        var storagePath = await storageService.SaveAsync(bytes, fileName, cancellationToken);

        var record = new GeneratedDocument
        {
            DocumentType  = DocumentType.Ppmp,
            Format        = request.Format,
            AgencyId      = request.AgencyId,
            StoragePath   = storagePath,
            FileName      = fileName,
            FileSizeBytes = bytes.Length,
            FiscalYear    = request.FiscalYear,
            GeneratedBy   = request.GeneratedBy
        };

        await unitOfWork.GeneratedDocumentRepository.AddAsync(record, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(record.Id, "PPMP document generated successfully.");
    }
}