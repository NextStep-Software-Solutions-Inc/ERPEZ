using ERPEZ.Application.Features.Planning.Document.Mappers;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Document.Queries.GetLibRealignmentPdf;

public class GetLibRealignmentPdfQueryHandler(
    IUnitOfWork unitOfWork,
    IDocumentRendererService rendererService)
    : IRequestHandler<GetLibRealignmentPdfQuery, (byte[] Bytes, string ContentType, string FileName)>
{
    public async Task<(byte[] Bytes, string ContentType, string FileName)> Handle(
        GetLibRealignmentPdfQuery request,
        CancellationToken cancellationToken)
    {
        var amendment = await unitOfWork.LIBAmendmentRequestRepository.GetByIdWithDetailsAsync(request.RealignmentId, cancellationToken)
            ?? await unitOfWork.LIBAmendmentRequestRepository.FindAsync(x => x.Id == request.RealignmentId, cancellationToken)
            ?? throw new NotFoundException($"LIB Realignment with ID '{request.RealignmentId}' was not found.");

        var originalLib = await unitOfWork.LineItemBudgetRepository.GetByIdWithDetailsAsync(amendment.LineItemBudgetId, cancellationToken)
            ?? throw new NotFoundException($"Original Line Item Budget '{amendment.LineItemBudgetId}' not found.");

        var proposedLib = await unitOfWork.LineItemBudgetRepository.GetByIdWithDetailsAsync(amendment.ProposedLineItemBudgetId, cancellationToken)
            ?? throw new NotFoundException($"Proposed Line Item Budget '{amendment.ProposedLineItemBudgetId}' not found.");

        string? organizationName = originalLib.Office?.Organization?.Name
            ?? proposedLib.Office?.Organization?.Name;
        string? organizationCode = originalLib.Office?.Organization?.Code
            ?? proposedLib.Office?.Organization?.Code;

        if (string.IsNullOrWhiteSpace(organizationName) && unitOfWork.OrganizationRepository != null)
        {
            var topOrg = await unitOfWork.OrganizationRepository.FindAsync(o => o.ParentId == null && !o.IsDeleted, cancellationToken)
                ?? await unitOfWork.OrganizationRepository.FindAsync(o => !o.IsDeleted, cancellationToken);
            organizationName = topOrg?.Name;
            organizationCode ??= topOrg?.Code;
        }

        var agencyName = originalLib.Office?.Name ?? proposedLib.Office?.Name;

        var dto = LibRealignmentMapper.MapToLibRealignmentPdfDataDto(
            amendment,
            originalLib,
            proposedLib,
            organizationName,
            agencyName,
            organizationCode);

        var bytes = await rendererService.RenderAsync(dto, DocumentType.LibRealignment, ExportFormat.Pdf, cancellationToken);
        var fileName = $"LibRealignment_{dto.FiscalYear}_{request.RealignmentId}.pdf";

        return (bytes, "application/pdf", fileName);
    }
}
