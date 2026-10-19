using ERPEZ.Application.Features.Planning.Document.Mappers;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Document.Commands.GenerateLibRealignmentPdf;

public class GenerateLibRealignmentPdfCommandHandler(
    IUnitOfWork unitOfWork,
    IDocumentRendererService rendererService,
    IDocumentStorageService storageService)
    : IRequestHandler<GenerateLibRealignmentPdfCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(
        GenerateLibRealignmentPdfCommand request,
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

        var bytes = await rendererService.RenderAsync(dto, DocumentType.LibRealignment, request.Format, cancellationToken);

        var extension = request.Format == ExportFormat.Excel ? "xlsx" : "pdf";
        var fileName = $"LibRealignment_{dto.FiscalYear}_{request.RealignmentId}_{DateTime.UtcNow:yyyyMMddHHmmss}.{extension}";
        var storagePath = await storageService.SaveAsync(bytes, fileName, cancellationToken);

        var record = new GeneratedDocument
        {
            Id = Guid.NewGuid(),
            DocumentType = DocumentType.LibRealignment,
            SourceDocumentId = request.RealignmentId,
            Format = request.Format,
            OfficeId = originalLib.OfficeId ?? Guid.Empty,
            StoragePath = storagePath,
            FileName = fileName,
            FileSizeBytes = bytes.Length,
            FiscalYear = dto.FiscalYear,
            GeneratedBy = request.GeneratedBy,
            CreatedAt = DateTime.UtcNow
        };

        await unitOfWork.GeneratedDocumentRepository.AddAsync(record, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(record.Id, "LIB Realignment document generated successfully.");
    }
}
