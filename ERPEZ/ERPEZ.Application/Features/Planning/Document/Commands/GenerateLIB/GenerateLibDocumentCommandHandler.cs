using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Document.Commands.GenerateLIB;

public class GenerateLibDocumentCommandHandler(
    IUnitOfWork              unitOfWork,
    IDocumentRendererService rendererService,
    IDocumentStorageService  storageService)
    : IRequestHandler<GenerateLibDocumentCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(
        GenerateLibDocumentCommand request,
        CancellationToken          cancellationToken)
    {
        var bytes     = await rendererService.RenderAsync(request, DocumentType.Lib, request.Format, cancellationToken);
        var extension = request.Format == ExportFormat.Excel ? "xlsx" : "pdf";
        var fileName  = $"LIB_{request.FiscalYear}_{DateTime.UtcNow:yyyyMMddHHmmss}.{extension}";
        var path      = await storageService.SaveAsync(bytes, fileName, cancellationToken);

        var record = new GeneratedDocument
        {
            DocumentType  = DocumentType.Lib,
            Format        = request.Format,
            AgencyId      = request.AgencyId,
            StoragePath   = path,
            FileName      = fileName,
            FileSizeBytes = bytes.Length,
            FiscalYear    = request.FiscalYear,
            GeneratedBy   = request.GeneratedBy
        };

        await unitOfWork.GeneratedDocumentRepository.AddAsync(record, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(record.Id, "LIB document generated successfully.");
    }
}