using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Domain.Enums;
using Microsoft.Extensions.DependencyInjection;

namespace ERPEZ.Infrastructure.Services.DocumentGeneration;

public class DocumentRendererService(IServiceProvider serviceProvider) : IDocumentRendererService
{
    public async Task<byte[]> RenderAsync<TRequest>(
        TRequest          request,
        DocumentType      documentType,
        ExportFormat      format,
        CancellationToken cancellationToken = default)
    {
        var renderers = serviceProvider.GetServices<IDocumentRenderer<TRequest>>();

        var renderer = renderers.FirstOrDefault(r =>
            r.DocumentType == documentType && r.Format == format)
            ?? throw new InvalidOperationException(
                $"No renderer registered for {documentType} ({format}).");

        return await renderer.RenderAsync(request, cancellationToken);
    }
}