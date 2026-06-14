using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Interfaces.Services;

public interface IDocumentRendererService
{
    Task<byte[]> RenderAsync<TRequest>(
        TRequest           request,
        DocumentType       documentType,
        ExportFormat       format,
        CancellationToken  cancellationToken = default);
}