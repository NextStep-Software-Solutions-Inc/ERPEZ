using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Common.Interfaces;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
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
        if (request is IAgencyLetterheadAware letterheadAware)
        {
            await EnrichLetterheadAsync(letterheadAware, cancellationToken);
        }

        var renderers = serviceProvider.GetServices<IDocumentRenderer<TRequest>>();

        var renderer = renderers.FirstOrDefault(r =>
            r.DocumentType == documentType && r.Format == format)
            ?? throw new InvalidOperationException(
                $"No renderer registered for {documentType} ({format}).");

        return await renderer.RenderAsync(request, cancellationToken);
    }

    private async Task EnrichLetterheadAsync(IAgencyLetterheadAware dto, CancellationToken cancellationToken)
    {
        try
        {
            var uow = serviceProvider.GetService<IUnitOfWork>();
            if (uow != null)
            {
                var agency = await uow.AgencyRepository.FindAsync(a => !a.IsDeleted, cancellationToken);
                if (agency != null)
                {
                    if (dto.LogoBytes == null || dto.LogoBytes.Length == 0)
                    {
                        dto.LogoBytes = agency.LogoImage;
                    }

                    if (string.IsNullOrWhiteSpace(dto.ProcuringEntityAddress))
                    {
                        dto.ProcuringEntityAddress = agency.Address;
                    }

                    if (string.IsNullOrWhiteSpace(dto.ProcuringEntityName) ||
                        dto.ProcuringEntityName.Equals("Agency Name", StringComparison.OrdinalIgnoreCase) ||
                        dto.ProcuringEntityName.Equals("[Agency Name]", StringComparison.OrdinalIgnoreCase) ||
                        dto.ProcuringEntityName.Equals("PROCURING ENTITY", StringComparison.OrdinalIgnoreCase) ||
                        dto.ProcuringEntityName.Contains("SuperAdmin", StringComparison.OrdinalIgnoreCase) ||
                        dto.ProcuringEntityName.Contains("Workspace", StringComparison.OrdinalIgnoreCase) ||
                        dto.ProcuringEntityName.Equals("USTP", StringComparison.OrdinalIgnoreCase))
                    {
                        if (!string.IsNullOrWhiteSpace(agency.Name))
                        {
                            dto.ProcuringEntityName = agency.Name.Trim();
                        }
                    }
                }
            }
        }
        catch
        {
            // Fail safely: if UnitOfWork is not available in isolated unit tests, proceed without failing
        }
    }
}