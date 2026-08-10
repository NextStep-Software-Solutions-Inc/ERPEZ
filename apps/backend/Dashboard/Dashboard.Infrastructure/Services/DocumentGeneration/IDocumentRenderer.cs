using ERPEZ.Domain.Enums;

namespace ERPEZ.Infrastructure.Services.DocumentGeneration;

internal interface IDocumentRenderer<in TRequest>
{
    DocumentType DocumentType { get; }
    ExportFormat Format       { get; }
    Task<byte[]> RenderAsync(TRequest request, CancellationToken cancellationToken = default);
}