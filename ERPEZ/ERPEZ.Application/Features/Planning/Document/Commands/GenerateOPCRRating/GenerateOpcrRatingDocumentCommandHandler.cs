using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Document.Commands.GenerateOPCRRating;

public class GenerateOpcrRatingDocumentCommandHandler(
    IUnitOfWork              unitOfWork,
    IDocumentRendererService rendererService,
    IDocumentStorageService  storageService)
    : IRequestHandler<GenerateOpcrRatingDocumentCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(
        GenerateOpcrRatingDocumentCommand request,
        CancellationToken                 cancellationToken)
    {
        var bytes     = await rendererService.RenderAsync(request, DocumentType.OpcrRating, request.Format, cancellationToken);
        var extension = request.Format == ExportFormat.Excel ? "xlsx" : "pdf";
        var fileName  = $"OPCR_Rating_{request.FiscalYear}_{DateTime.UtcNow:yyyyMMddHHmmss}.{extension}";
        var path      = await storageService.SaveAsync(bytes, fileName, cancellationToken);

        var record = new GeneratedDocument
        {
            DocumentType  = DocumentType.OpcrRating,
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

        return ApiResponse<Guid>.Success(record.Id, "OPCR Rating document generated successfully.");
    }
}